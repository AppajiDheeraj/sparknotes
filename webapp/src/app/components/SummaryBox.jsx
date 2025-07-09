"use client";
import { useState, useRef } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import {
  Brain,
  Lightbulb,
  HelpCircle,
  LoaderIcon,
  ClockFadingIcon,
  Volume2,
  VolumeX,
  Download,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import ReactFlow from "reactflow";
import { Background } from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { Badge } from "../../components/ui/badge";
import jsPDF from "jspdf";
import { toPng } from "html-to-image"; // ⭐️ FIX 1: Using a more reliable library for image capture

export default function SummaryBox({ summary, loading }) {
  const [mindmap, setMindmap] = useState("");
  const [xtended, setXtended] = useState("");
  const [whatIfs, setWhatIfs] = useState("");

  const [loadingMindmap, setLoadingMindmap] = useState(false);
  const [loadingXtended, setLoadingXtended] = useState(false);
  const [loadingWhatIfs, setLoadingWhatIfs] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const mindmapRef = useRef(null);

  const holesMobile = 10;
  const holesDesktop = 40;

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Fixed markdown parser that doesn't make everything bold
  const parseMarkdownForPDF = (content) => {
    if (!content) return "";

    let processedContent = content
      .replace(/\*\*(.*?)\*\*/g, (match, boldText) => {
        return `BOLD_START${boldText}BOLD_END`;
      })
      .replace(/\*(.*?)\*/g, (match, italicText) => {
        return `ITALIC_START${italicText}ITALIC_END`;
      })
      .replace(/^\s*[\*\-\+]\s+(.*)/gm, (match, text) => `• ${text.trim()}`)
      .replace(
        /^\s*(\d+)\.\s+(.*)/gm,
        (match, num, text) => `${num}. ${text.trim()}`
      )
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      // ⭐️ FIX 2: This is the key fix for the bullet point issue.
      // It finds a bullet followed by a bold marker and moves the bullet *inside* the marker.
      // This forces the renderer to treat "• Bold Text" as a single, bolded element.
      // E.g., '• BOLD_STARTHello' becomes 'BOLD_START• Hello'.
      .replace(/• BOLD_START/g, "BOLD_START• ")
      .trim();

    return processedContent;
  };

  // Function to render text with mixed formatting in PDF
  const renderMixedFormattingText = (
    pdf,
    text,
    x,
    y,
    maxWidth,
    fontSize = 11
  ) => {
    const parts = [];
    let currentIndex = 0;

    const boldRegex = /BOLD_START(.*?)BOLD_END/g;
    const italicRegex = /ITALIC_START(.*?)ITALIC_END/g;

    let match;
    const markers = [];

    // Find bold markers
    while ((match = boldRegex.exec(text)) !== null) {
      markers.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "bold",
        content: match[1],
        original: match[0],
      });
    }

    // Find italic markers
    while ((match = italicRegex.exec(text)) !== null) {
      markers.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "italic",
        content: match[1],
        original: match[0],
      });
    }

    // Sort by position
    markers.sort((a, b) => a.start - b.start);

    let lastIndex = 0;
    markers.forEach((marker) => {
      if (marker.start > lastIndex) {
        const beforeText = text.slice(lastIndex, marker.start);
        if (beforeText.trim()) {
          parts.push({ text: beforeText, bold: false, italic: false });
        }
      }
      parts.push({
        text: marker.content,
        bold: marker.type === "bold",
        italic: marker.type === "italic",
      });
      lastIndex = marker.end;
    });

    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({ text: remainingText, bold: false, italic: false });
      }
    }

    if (parts.length === 0) {
      parts.push({ text: text, bold: false, italic: false });
    }

    let currentY = y;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    parts.forEach((part) => {
      pdf.setFontSize(fontSize);
      const fontStyle = part.bold ? "bold" : part.italic ? "italic" : "normal";
      pdf.setFont("helvetica", fontStyle);

      const lines = pdf.splitTextToSize(part.text, maxWidth);
      lines.forEach((line) => {
        // Auto new page if needed
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, x, currentY);
        currentY += fontSize * 0.6;
      });
    });

    return currentY;
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("YouTube Video Summary", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 25;

      // Add summary section
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary", margin, yPosition);
      yPosition += 15;

      // Parse and add summary sections
      const parsed = parseSummary(summary);

      for (const [section, content] of Object.entries(parsed)) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(section, margin, yPosition);
        yPosition += 10;

        const processedContent = parseMarkdownForPDF(content);
        yPosition = renderMixedFormattingText(
          pdf,
          processedContent,
          margin,
          yPosition,
          contentWidth,
          11
        );
        yPosition += 10;
      }

      // Add mindmap as image if available
      if (mindmap && mindmapRef.current) {
        try {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.text("MindMap", margin, yPosition);
          yPosition += 15;

          // ⭐️ KEY FIX: Wait for ReactFlow to finish its internal rendering.
          // This gives the SVG elements time to be drawn in the DOM before capture.
          await new Promise((resolve) => setTimeout(resolve, 500));

          const mindmapElement = mindmapRef.current;
          
          const dataUrl = await toPng(mindmapElement, {
            // Match the on-screen appearance for a perfect capture
            backgroundColor: '#000000',
            width: mindmapElement.offsetWidth,
            height: mindmapElement.offsetHeight,
            pixelRatio: 3 // Capture at high resolution
          });

          // Use jsPDF's built-in function to get image properties
          const imgProps = pdf.getImageProperties(dataUrl);
          const pdfImgWidth = contentWidth;
          const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

          // Check if the image itself needs a new page
          if (yPosition + pdfImgHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.addImage(
            dataUrl,
            "PNG",
            margin,
            yPosition,
            pdfImgWidth,
            pdfImgHeight
          );
          yPosition += pdfImgHeight + 15;

        } catch (error) {
          console.error("Error capturing or adding mindmap to PDF:", error);
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          pdf.text("Mindmap could not be rendered in PDF.", margin, yPosition);
          yPosition += 15;
        }
      }

      // Add extended thinking section
      if (xtended) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Extended Thinking", margin, yPosition);
        yPosition += 15;

        const processedXtended = parseMarkdownForPDF(xtended);
        yPosition = renderMixedFormattingText(
          pdf,
          processedXtended,
          margin,
          yPosition,
          contentWidth,
          11
        );
        yPosition += 10;
      }

      // Add what-ifs section
      if (whatIfs) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("What Ifs?", margin, yPosition);
        yPosition += 15;

        const processedWhatIfs = parseMarkdownForPDF(whatIfs);
        yPosition = renderMixedFormattingText(
          pdf,
          processedWhatIfs,
          margin,
          yPosition,
          contentWidth,
          11
        );
      }

      pdf.save("youtube_summary.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };


  const handleSpeechToggle = () => {
    if (!summary) return;

    const synth = window.speechSynthesis;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(summary);
      utterance.onend = () => setIsSpeaking(false);
      synth.speak(utterance);
      setIsSpeaking(true);
    }
  };

  function parseSummary(summary) {
    const sections = {};
    const sectionRegex = /^##\s(.+?):\s*$/gm;
    let match;
    let lastIndex = 0;
    let lastSection = "";

    while ((match = sectionRegex.exec(summary)) !== null) {
      if (lastSection) {
        sections[lastSection] = summary.slice(lastIndex, match.index).trim();
      }
      lastSection = match[1];
      lastIndex = sectionRegex.lastIndex;
    }

    if (lastSection) {
      sections[lastSection] = summary.slice(lastIndex).trim();
    }

    return sections;
  }

  const getLayoutedElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: "TB" }); // Top-to-bottom layout

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 150, height: 50 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.position = {
        x: nodeWithPosition.x,
        y: nodeWithPosition.y,
      };
      node.draggable = true; // Allow manual dragging after auto-layout
      return node;
    });

    return { nodes: layoutedNodes, edges };
  };

  function estimateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  }

  const fetchExtra = async (type) => {
    const loadingSetter = {
      mindmap: setLoadingMindmap,
      xtended: setLoadingXtended,
      whatifs: setLoadingWhatIfs,
    }[type];

    loadingSetter(true);
    try {
      const res = await fetch(`/api/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: window.currentUrl }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Backend error: ${errText}`);
      }

      const data = await res.json();
      if (type === "mindmap") setMindmap(data.mindmap);
      if (type === "xtended") setXtended(data.extended);
      if (type === "whatifs") setWhatIfs(data.whatifs);
    } catch (err) {
      console.error(err);
      alert("Error fetching extra content.");
    } finally {
      loadingSetter(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="mt-6 p-4 flex flex-col items-center">
          <p className="text-lg sm:text-xl font-semibold leading-relaxed text-center">
            Generating your <br />
            YouTube summary...
          </p>
          <p className="text-sm sm:text-base text-gray-300 mt-2 text-center">
            This may take a few seconds, please wait...
          </p>
          <LoaderIcon className="w-6 h-6 animate-spin text-white mt-4" />
        </div>
      );
    }

    if (summary) {
      const parsed = parseSummary(summary);

      return (
        <div className="mt-6 text-left">
          <div className="absolute right-10 top-16 flex items-center gap-2">
            <Badge className="text-xs sm:text-sm bg-[#FFFBD6] text-black rounded-xl px-2 py-1">
              <ClockFadingIcon className="inline-block w-5 h-5 mr-1 text-black" />
              {estimateReadingTime(summary)} mins read
            </Badge>
            <button
              onClick={handleSpeechToggle}
              className="bg-[#FFFBD6] text-black rounded-full p-1 hover:scale-105 transition"
              title={isSpeaking ? "Stop Audio" : "Play Audio"}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="text-xs sm:text-sm bg-background px-4 py-1 rounded-full text-black flex items-center gap-2 disabled:opacity-50"
            >
              {downloading ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </div>

          {/* Centered Heading */}
          <h3
            style={{ fontFamily: "Luckiest Guy, sans-serif" }}
            className="text-2xl sm:text-3xl text-white text-center"
          >
            Summary
          </h3>

          {Object.entries(parsed).map(([section, content]) => (
            <div key={section} className="mb-6">
              <h4 className="font-semibold text-lg mb-2 text-white underline underline-offset-4">
                {section}
              </h4>
              <div className="text-sm sm:text-base leading-relaxed text-gray-100">
                <ReactMarkdown
                  components={{
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc ml-5 space-y-1" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal ml-5 space-y-1" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="leading-snug" {...props} />
                    ),
                    a: ({ node, href, ...props }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline hover:text-blue-300"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-3" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-white" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic" {...props} />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="mt-6 p-16 flex flex-col items-center">
        <p className="text-lg sm:text-xl font-semibold text-center leading-relaxed">
          Your YouTube summary <br /> will appear here soon.
        </p>
        <p className="text-sm sm:text-base text-gray-400 mt-2 text-center">
          Paste a YouTube link or generate a summary to see it here.
        </p>
      </div>
    );
  };

  return (
    <div className="w-full px-30 bg-[#FFFBD6] flex flex-col items-center my-10">
      <div className="relative w-full rounded-3xl overflow-hidden bg-black p-8 text-center text-white">
        {/* Holes */}
        <div className="absolute top-1 left-0 w-full flex justify-between px-4 py-2">
          <div className="flex w-full justify-between md:hidden">
            {Array.from({ length: holesMobile }).map((_, i) => (
              <span
                key={i}
                className="w-3 h-3 bg-[#FFFBD6] rounded-full"
              ></span>
            ))}
          </div>
          <div className="hidden md:flex w-full justify-between">
            {Array.from({ length: holesDesktop }).map((_, i) => (
              <span
                key={i}
                className="w-3 h-3 bg-[#FFFBD6] rounded-full"
              ></span>
            ))}
          </div>
        </div>

        {/* Summary */}
        {renderContent()}

        {summary && (
          <>
            <Tabs defaultValue="mindmap" className="w-full mt-6">
              <TabsList className="bg-background rounded-full p-2">
                <TabsTrigger
                  value="mindmap"
                  className="flex items-center justify-center gap-2 text-black text-base px-6 py-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full"
                >
                  <Brain className="w-5 h-5" />
                  MindMap
                </TabsTrigger>

                <TabsTrigger
                  value="xtended"
                  className="flex items-center justify-center gap-2 text-black text-base px-6 py-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full"
                >
                  <Lightbulb className="w-5 h-5" />
                  Xtended Thinking
                </TabsTrigger>

                <TabsTrigger
                  value="whatifs"
                  className="flex items-center justify-center gap-2 text-black text-base px-6 py-3 data-[state=active]:bg-black data-[state=active]:text-white rounded-full"
                >
                  <HelpCircle className="w-5 h-5" />
                  What Ifs?
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mindmap">
                {!mindmap && !loadingMindmap && (
                  <button
                    onClick={() => fetchExtra("mindmap")}
                    className="bg-background px-4 py-2 rounded-full text-black my-8"
                  >
                    Generate MindMap
                  </button>
                )}
                {loadingMindmap ? (
                  <div className="flex justify-center items-center mt-8">
                    <LoaderIcon className="w-6 h-6 animate-spin text-white" />
                  </div>
                ) : mindmap ? (
                  (() => {
                    let jsonString = mindmap.trim();

                    if (jsonString.startsWith("```")) {
                      jsonString = jsonString
                        .replace(/```.*?\n([\s\S]*?)```/, "$1")
                        .trim();
                    }

                    try {
                        let { nodes, edges } = JSON.parse(jsonString);

                        // Apply auto-layout
                        ({ nodes, edges } = getLayoutedElements(nodes, edges));

                        return (
                          <div
                            ref={mindmapRef}
                            style={{ width: "100%", height: "500px" }}
                          >
                            <ReactFlow
                              nodes={nodes}
                              edges={edges}
                              fitView
                              panOnDrag
                              zoomOnScroll
                            >
                              <Background
                                gap={16}
                                size={1}
                                color="#ccc"
                                variant="dots" // Dots background
                              />
                            </ReactFlow>
                          </div>
                        );
                    } catch (e) {
                        return <p className="mt-4 text-red-400">Error parsing MindMap data. It might be malformed.</p>
                    }
                  })()
                ) : (
                  <p className="mt-4">No MindMap generated yet.</p>
                )}
              </TabsContent>

              <TabsContent value="xtended">
                {!xtended && !loadingXtended && (
                  <button
                    onClick={() => fetchExtra("xtended")}
                    className="bg-background px-4 py-2 rounded-full text-black my-8"
                  >
                    Generate Xtended Advantage
                  </button>
                )}
                {loadingXtended ? (
                  <div className="flex justify-center items-center mt-8">
                    <LoaderIcon className="w-6 h-6 animate-spin text-white" />
                  </div>
                ) : xtended ? (
                  <div className="text-left mt-4 text-gray-100 font-sans text-base leading-relaxed">
                    <ReactMarkdown
                      components={{
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc ml-5 space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal ml-5 space-y-1"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-snug" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-3" {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-xl font-bold mb-3 mt-4"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-lg font-bold mb-2 mt-3"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-base font-bold mb-2 mt-2"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold text-white" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic" {...props} />
                        ),
                      }}
                    >
                      {xtended}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="mt-4">No Xtended content generated yet.</p>
                )}
              </TabsContent>

              <TabsContent value="whatifs">
                {!whatIfs && !loadingWhatIfs && (
                  <button
                    onClick={() => fetchExtra("whatifs")}
                    className="bg-background px-4 py-2 rounded-full text-black my-8"
                  >
                    Generate What Ifs?
                  </button>
                )}
                {loadingWhatIfs ? (
                  <div className="flex justify-center items-center mt-8">
                    <LoaderIcon className="w-6 h-6 animate-spin text-white" />
                  </div>
                ) : whatIfs ? (
                  <div className="text-left mt-4 text-gray-100 font-sans text-base leading-relaxed">
                    <ReactMarkdown
                      components={{
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc ml-5 space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal ml-5 space-y-1"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="leading-snug" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-3" {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-xl font-bold mb-3 mt-4"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-lg font-bold mb-2 mt-3"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-base font-bold mb-2 mt-2"
                            {...props}
                          />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold text-white" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic" {...props} />
                        ),
                      }}
                    >
                      {whatIfs}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="mt-4">No What Ifs generated yet.</p>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}