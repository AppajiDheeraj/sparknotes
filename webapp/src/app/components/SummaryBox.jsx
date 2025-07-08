"use client";
import { useState } from "react";
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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import ReactFlow from "reactflow";
import { Background } from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { Badge } from "../../components/ui/badge";

export default function SummaryBox({ summary, loading }) {
  const [mindmap, setMindmap] = useState("");
  const [xtended, setXtended] = useState("");
  const [whatIfs, setWhatIfs] = useState("");

  const [loadingMindmap, setLoadingMindmap] = useState(false);
  const [loadingXtended, setLoadingXtended] = useState(false);
  const [loadingWhatIfs, setLoadingWhatIfs] = useState(false);

  const holesMobile = 10;
  const holesDesktop = 40;

  const [isSpeaking, setIsSpeaking] = useState(false);

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
        <div className="mt-6 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-lg sm:text-xl font-semibold leading-relaxed">
            Generating your <br />
            YouTube summary...
          </p>
        </div>
      );
    }

    if (summary) {
      const parsed = parseSummary(summary);

      return (
        <div className="mt-6 text-left">
          <div className="absolute right-10 top-16 flex items-center gap-2">
            <Badge className="text-xs sm:text-sm bg-[#FFFBD6] text-black rounded-xl px-2 py-1">
              <ClockFadingIcon className="inline-block w-4 h-4 mr-1 text-black" />
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
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line text-gray-100">
                {content}
              </p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="mt-6">
        <p className="text-lg sm:text-xl font-semibold leading-relaxed">
          your <br />
          youtube summary <br />
          will appear <br />
          here
        </p>
      </div>
    );
  };

  return (
    <div className="w-full px-30 bg-[#FFFBD6] flex flex-col items-center my-10">
      <div className="relative w-full rounded-3xl overflow-hidden bg-black p-8 text-center text-white">
        {/* Holes */}
        <div className="absolute top-0 left-0 w-full flex justify-between px-4 py-2">
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

                  let { nodes, edges } = JSON.parse(jsonString);

                  // Apply auto-layout
                  ({ nodes, edges } = getLayoutedElements(nodes, edges));

                  return (
                    <div style={{ width: "100%", height: "500px" }}>
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
                <pre className="text-left mt-4 whitespace-pre-wrap text-gray-100 font-sans text-base leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <span {...props} />,
                    }}
                  >
                    {xtended.replace(/\n{2,}/g, "\n")}
                  </ReactMarkdown>
                </pre>
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
                <pre className="text-left mt-4 whitespace-pre-wrap text-gray-100 font-sans text-base leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <span {...props} />,
                    }}
                  >
                    {whatIfs.replace(/\n{2,}/g, "\n")}
                  </ReactMarkdown>
                </pre>
              ) : (
                <p className="mt-4">No What Ifs generated yet.</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
