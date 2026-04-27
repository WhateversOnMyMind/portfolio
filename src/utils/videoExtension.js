import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";

function VideoNodeView({ node }) {
    return (
        <NodeViewWrapper>
            <div style={{ margin: "16px 0", background: "#000", borderRadius: "4px", overflow: "hidden" }}>
                <video
                    src={node.attrs.src}
                    controls
                    playsInline
                    style={{ width: "100%", display: "block", maxHeight: "480px" }}
                />
            </div>
        </NodeViewWrapper>
    );
}

export const VideoBlock = Node.create({
    name: "videoBlock",
    group: "block",
    atom: true,
    draggable: true,
    addAttributes() {
        return { src: { default: null } };
    },
    parseHTML() {
        return [{
            tag: "div[data-video-block]",
            getAttrs: el => ({ src: el.querySelector("video")?.getAttribute("src") || null }),
        }];
    },
    renderHTML({ HTMLAttributes }) {
        const { src, ...rest } = HTMLAttributes;
        return [
            "div",
            mergeAttributes(rest, { "data-video-block": "" }),
            ["video", { src, controls: "", playsinline: "" }],
        ];
    },
    addNodeView() {
        return ReactNodeViewRenderer(VideoNodeView);
    },
    addCommands() {
        return {
            insertVideo: (src) => ({ commands }) =>
                commands.insertContent({ type: this.name, attrs: { src } }),
        };
    },
});
