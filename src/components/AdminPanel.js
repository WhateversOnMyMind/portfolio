import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import ImageResize from "tiptap-extension-resize-image";
import Youtube from "@tiptap/extension-youtube";
import { supabase } from "../supabase";

export default function AdminPanel({ accent, projects, setProjects, editingProject, setEditingProject, fetchProjects }) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }));
    const [status, setStatus] = useState("draft");
    const [saveMsg, setSaveMsg] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageUpload = async (file) => {
        setUploadingImage(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error } = await supabase.storage.from('portfolio-images').upload(fileName, file);
        if (error) { alert("Image upload failed: " + error.message); setUploadingImage(false); return null; }
        const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
        setUploadingImage(false);
        return data.publicUrl;
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false, autolink: true }),
            ImageResize,
            Youtube.configure({ inline: false, width: 640, height: 480, HTMLAttributes: { class: 'w-full rounded-md border-2 border-gray-800 my-4 aspect-video' } }),
        ],
        content: "<p>Start writing...</p>",
        editorProps: {
            attributes: { class: 'prose-content min-h-[500px] outline-none' },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;
                for (const item of items) {
                    if (item.type.indexOf("image") === 0) {
                        event.preventDefault();
                        handleImageUpload(item.getAsFile()).then(url => { if (url) editor.chain().focus().setImage({ src: url }).run(); });
                        return true;
                    }
                }
                return false;
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer?.files?.length > 0) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.indexOf("image") === 0) {
                        event.preventDefault();
                        handleImageUpload(file).then(url => { if (url) editor.chain().focus().setImage({ src: url }).run(); });
                        return true;
                    }
                }
                return false;
            },
        },
    });

    useEffect(() => {
        if (editingProject && editor) {
            const p = projects.find(x => x.id === editingProject);
            if (p) { setTitle(p.title); setDate(p.date); setStatus(p.status); editor.commands.setContent(p.body || ""); }
        }
    }, [editingProject, editor]);

    const clearEditor = () => {
        setEditingProject(null);
        setTitle("");
        setDate(new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }));
        setStatus("draft");
        editor?.commands.clearContent();
        setSaveMsg("");
    };

    const save = async () => {
        if (!title.trim()) return alert("Title required.");
        setSaving(true);
        const payload = { title, date, status, body: editor?.getHTML() || "", updated: Date.now() };
        if (editingProject) {
            const { error } = await supabase.from("projects").update(payload).eq("id", editingProject);
            if (error) alert("Save failed: " + error.message);
        } else {
            const id = Date.now();
            const { error } = await supabase.from("projects").insert([{ id, ...payload, created: id }]);
            if (error) alert("Save failed: " + error.message);
            else setEditingProject(id);
        }
        await fetchProjects();
        setSaving(false);
        setSaveMsg("Saved.");
        setTimeout(() => setSaveMsg(""), 3000);
    };

    const deleteProject = async (id) => {
        if (!window.confirm("Delete this project?")) return;
        await supabase.from("projects").delete().eq("id", id);
        if (editingProject === id) clearEditor();
        await fetchProjects();
    };

    const togglePublish = async (id, currentStatus) => {
        await supabase.from("projects").update({ status: currentStatus === "published" ? "draft" : "published" }).eq("id", id);
        await fetchProjects();
    };

    const tbBtn = (label, action, isActive = false) => (
        <button onClick={action} className="px-2 py-1 text-xs cursor-pointer rounded-sm transition-colors"
                style={{ fontFamily: "monospace", background: isActive ? accent : "transparent", color: isActive ? "#fff" : "#333", border: "1px solid transparent" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#e0e0e0"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
            {label}
        </button>
    );

    const setLink = () => {
        const url = window.prompt('URL');
        if (url === null) return;
        if (url === '') editor.chain().focus().extendMarkRange('link').unsetLink().run();
        else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const sorted = [...projects].sort((a, b) => b.created - a.created);

    return (
        <div>
            <div className="flex justify-between items-baseline pb-2 mb-5" style={{ borderBottom: `3px solid ${accent}` }}>
                <h1 className="special-elite text-2xl uppercase tracking-widest">Workspace</h1>
                {editingProject && <span className="special-elite text-xs text-gray-500">Editing ID: {editingProject}</span>}
            </div>

            <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "1fr 150px 120px" }}>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document Title" className="p-3 text-lg font-bold" style={{ border: "1px solid #ccc" }} />
                <input value={date} onChange={e => setDate(e.target.value)} className="p-3 text-sm special-elite" style={{ border: "1px solid #ccc" }} />
                <select value={status} onChange={e => setStatus(e.target.value)} className="p-3 text-sm special-elite" style={{ border: "1px solid #ccc" }}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

            <div style={{ background: "#f8f9fa", border: "1px solid #c7c7c7", borderRadius: "4px" }}>
                <div className="sticky top-14 z-40 flex flex-wrap gap-1 p-2 items-center" style={{ background: "#edf2fa", borderBottom: "1px solid #c7c7c7", borderRadius: "4px 4px 0 0" }}>
                    {editor && (
                        <>
                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
                                {tbBtn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
                                {tbBtn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
                                {tbBtn("S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
                            </div>
                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
                                {tbBtn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
                                {tbBtn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
                                {tbBtn("P", () => editor.chain().focus().setParagraph().run(), editor.isActive("paragraph"))}
                            </div>
                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("Left", () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }))}
                                {tbBtn("Center", () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }))}
                                {tbBtn("Right", () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }))}
                                {tbBtn("Justify", () => editor.chain().focus().setTextAlign('justify').run(), editor.isActive({ textAlign: 'justify' }))}
                            </div>
                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
                                {tbBtn("Num", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
                                {tbBtn("Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
                            </div>
                            <div className="flex gap-1 pr-2 mr-2" style={{ borderRight: "1px solid #ccc" }}>
                                {tbBtn("Link", setLink, editor.isActive("link"))}
                                {tbBtn("Img(URL)", () => { const url = window.prompt('Image URL'); if (url) editor.chain().focus().setImage({ src: url }).run(); })}
                                {tbBtn("YouTube", () => { const url = window.prompt("Enter YouTube URL:"); if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run(); })}
                            </div>
                            <div className="text-xs text-gray-500 ml-auto flex items-center gap-2">
                                {uploadingImage ? "Uploading image..." : "Drag/Paste images supported"}
                            </div>
                        </>
                    )}
                </div>
                <div className="p-8 mx-auto my-4 bg-white shadow-sm" style={{ maxWidth: "850px", border: "1px solid #ddd", minHeight: "600px" }}>
                    <EditorContent editor={editor} />
                </div>
            </div>

            <div className="flex gap-3 mt-4 items-center">
                <button onClick={save} disabled={saving} className="special-elite uppercase text-xs tracking-widest px-6 py-3 cursor-pointer text-white" style={{ background: accent, opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving..." : "Commit Document"}
                </button>
                <button onClick={clearEditor} className="special-elite uppercase text-xs tracking-widest px-6 py-3 cursor-pointer" style={{ border: "2px solid #222" }}>
                    Start Fresh
                </button>
                {saveMsg && <span className="special-elite text-sm text-green-700 ml-2">{saveMsg}</span>}
            </div>

            <div className="mt-16 pt-8" style={{ borderTop: "3px solid #222" }}>
                <h3 className="special-elite text-sm uppercase mb-6 tracking-widest" style={{ color: accent }}>// Document Registry</h3>
                <div className="grid gap-2">
                    {sorted.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-4 bg-white" style={{ border: "1px solid #222" }}>
                            <div>
                                <span className="font-bold text-lg mr-3">{p.title}</span>
                                {p.status === "draft" && <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-sm font-mono">DRAFT</span>}
                                <div className="text-sm text-gray-500 mt-1 font-mono">{p.date} &middot; ID: {p.id}</div>
                            </div>
                            <div className="flex gap-3 special-elite text-sm">
                                <button onClick={() => setEditingProject(p.id)} className="hover:underline text-blue-700">Load</button>
                                <button onClick={() => togglePublish(p.id, p.status)} className="hover:underline">{p.status === "published" ? "Unpublish" : "Publish"}</button>
                                <button onClick={() => deleteProject(p.id)} className="hover:underline text-red-600">Drop</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .ProseMirror { outline: none; }
                .ProseMirror p { margin-bottom: 1em; }
                .ProseMirror img { max-width: 100%; height: auto; display: block; }
                .ProseMirror img.ProseMirror-selectednode { outline: 3px solid ${accent}; }
                .ProseMirror blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; }
                .ProseMirror a { color: ${accent}; text-decoration: underline; cursor: pointer; }
                .ProseMirror iframe { border-radius: 4px; border: 2px solid #222; }
            `}</style>
        </div>
    );
}
