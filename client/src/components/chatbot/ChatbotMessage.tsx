// "use client";
// import type { Message } from "@/types/chat";
// import { cn } from "@/lib/utils";
// import { Loader, MessageSquareText } from "lucide-react";
// import MDEditor from "@uiw/react-md-editor";
// import katex from "katex";
// import "katex/dist/katex.css";
// import MarkdownPreview from "@uiw/react-markdown-preview";
// import remarkMath from "remark-math";
// import remarkGfm from "remark-gfm";
// import rehypeKatex from "rehype-katex";
// import { useTheme } from "@/hooks/useTheme";
// import { useEffect } from "react";

// // Normalize fenced code blocks labeled as "katex" into $$ math blocks $$ so rehype-katex can render them
// function normalizeMarkdown(src: string) {
//   // Convert ```katex ... ``` to $$...$$
//   const fencedToMath = src.replace(/```katex[\r\n]+([\s\S]*?)```/g, (_m, p1) => `$$\n${p1.trim()}\n$$`);
//   return fencedToMath;
// }

// export function ChatMessage({ message }: { message: Message }) {
//   const theme = useTheme();
//   const isUser = message.role === "user";
//   const formattedTime = (() => {
//     const date = new Date(message.timestamp);
//     if (isNaN(date.getTime())) return message.timestamp;
//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   })();



//   return (
//     <div className={cn("flex flex-col gap-1 p-0")}>
//       <div
//         className={cn(
//           "py-3",
//           isUser
//             ? "max-w-[90%] md:max-w-[80%] bg-primary dark:bg-primary/80 text-white self-end shadow-sm px-4 rounded-lg"
//             : "w-[100%] md:w-[90%] self-start border-b-2 rounded-b-none"
//         )}
//       >
//         <div className="flex items-baseline justify-between gap-4 mb-2">
//           <div className="font-semibold text-sm">
//             {isUser ? (
//               "Meg"
//             ) : (
//               <div className="flex items-center gap-2">
//                 <MessageSquareText className="w-5 h-5" />
//                 <p>Flux</p>
//               </div>
//             )}
//           </div>
//           <div className={cn("text-xs text-white")}>{formattedTime}</div>
//         </div>

//         {/* Message content */}
//         {isUser ? (
//           <p
//             className={cn(
//               "whitespace-pre-wrap text-base leading-relaxed text-foreground text-white"
//             )}
//           >
//             {message.content}
//           </p>
//         ) : message.status === "writing" && message.content === "" ? (
//           <span className="flex items-center gap-2 text-base">
//             <Loader className="animate-spin h-4 w-4" />
//             <span>Tenker...</span>
//           </span>
//         ) : (
//           <div className="prose prose-sm max-w-none dark:prose-invert markdown-body">
//             <MarkdownPreview
//               source={normalizeMarkdown(message.content)}
//               remarkPlugins={[remarkMath, remarkGfm]}
//               rehypePlugins={[rehypeKatex]}
//               style={{
//                 background: "transparent",
//                 color: "inherit",
//                 fontSize: "0.875rem",
//               }}
//               wrapperElement={{
//                 "data-color-mode": theme.resolvedTheme === "dark" ? "dark" : "light",
//               }}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
