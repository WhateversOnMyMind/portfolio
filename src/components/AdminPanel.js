import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import ImageResize from "tiptap-extension-resize-image";
import Youtube from "@tiptap/extension-youtube";
import { supabase } from "../supabase";
import { compressImage } from "../utils/compressImage";
import { uploadToR2, deleteFromR2 } from "../utils/r2";
import { VideoBlock } from "../utils/videoExtension";

function parseFlairs(raw) {
    try { return JSON.parse(raw || "[]"); } catch { return []; }
}

export default function AdminPanel({ accent, projects, setProjects, editingProject, setEditingProject, fetchProjects }) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }));
    const [status, setStatus] = useState("draft");
    const [flairs, setFlairs] = useState([]);
    const [flairInput, setFlairInput] = useState("");
    const [saveMsg, setSaveMsg] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const videoInputRef = useRef(null);

    const [galleryImages, setGalleryImages] = useState([]);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [galleryCaption, setGalleryCaption] = useState("");

    useEffect(() => { fetchGallery(); }, []);

    const fetchGallery = async () => {
        const { data } = await supabase.from("gallery").select("*").order("created", { ascending: false });
        if (data) setGalleryImages(data);
    };

    const handleImageUpload = async (file) => {
        setUploadingImage(true);
        try {
            const compressed = await compressImage(file);
            const key = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
            const url = await uploadToR2(key, compressed);
            setUploadingImage(false);
            return url;
        } catch (e) {
            alert("Upload failed: " + e.message);
            setUploadingImage(false);
            return null;
        }
    };

    const handleVideoUpload = async (file) => {
        setUploadingVideo(true);
        try {
            const ext = file.name.split(".").pop().toLowerCase() || "mp4";
            const key = `videos/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
            const url = await uploadToR2(key, file, file.type || "video/mp4");
            setUploadingVideo(false);
            return url;
        } catch (e) {
            alert("Video upload failed: " + e.message);
            setUploadingVideo(false);
            return null;
        }
    };

    const uploadGalleryImages = async (files) => {
        setUploadingGallery(true);
        const caption = galleryCaption;
        const rows = [];
        for (const file of files) {
            try {
                const compressed = await compressImage(file);
                const key = `gallery/${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
                const url = await uploadToR2(key, compressed);
                const id = Date.now() + Math.floor(Math.random() * 1e6);
                rows.push({ id, url, caption, created: id });
            } catch (e) {
                alert(`Failed: ${file.name} — ${e.message}`);
            }
        }
        if (rows.length) {
            const { error } = await supabase.from("gallery").insert(rows);
            if (error) alert("DB insert failed: " + error.message);
        }
        setGalleryCaption("");
        await fetchGallery();
        setUploadingGallery(false);
    };

    const deleteGalleryImage = async (id) => {
        if (!window.confirm("Delete this image?")) return;
        const img = galleryImages.find(x => x.id === id);
        if (img?.url) await deleteFromR2(img.url).catch(() => {});
        await supabase.from("gallery").delete().eq("id", id);
        setGalleryImages(prev => prev.filter(x => x.id !== id));
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false, autolink: true }),
            ImageResize,
            Youtube.configure({ inline: false, width: 640, height: 480, HTMLAttributes: { class: 'w-full rounded-md border-2 border-gray-800 my-4 aspect-video' } }),
            VideoBlock,
        ],
        content: "<p>Start writing...</p>",
        editorProps: {
            attributes: { class: 'prose-content min-h-[500px] outline-none' },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;
                for (const item of items) {
                    if (item.type.startsWith("image/")) {
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
                    if (file.type.startsWith("image/")) {
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
            if (p) {
                setTitle(p.title);
                setDate(p.date);
                setStatus(p.status);
                setFlairs(parseFlairs(p.flairs));
                editor.commands.setContent(p.body || "");
            }
        }
    }, [editingProject, editor]);

    const clearEditor = () => {
        setEditingProject(null);
        setTitle("");
        setDate(new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }));
        setStatus("draft");
        setFlairs([]);
        setFlairInput("");
        editor?.commands.clearContent();
        setSaveMsg("");
    };

    const addFlair = () => {
        const f = flairInput.trim();
        if (f && !flairs.includes(f)) setFlairs(prev => [...prev, f]);
        setFlairInput("");
    };

    const save = async () => {
        if (!title.trim()) return alert("Title required.");
        setSaving(true);
        const payload = { title, date, status, flairs: JSON.stringify(flairs), body: editor?.getHTML() || "", updated: Date.now() };
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
        <button onClick={action}
                className="px-1 py-0.5 md:px-2 md:py-1 text-xs cursor-pointer rounded-sm"
                style={{ fontFamily: "monospace", background: isActive ? accent : "transparent", color: "#fff", border: "1px solid transparent", flexShrink: 0, whiteSpace: "nowrap" }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
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
            {/* Header */}
            <div className="flex justify-between items-baseline pb-2 mb-5" style={{ borderBottom: `3px solid ${accent}` }}>
                <h1 className="special-elite text-2xl uppercase tracking-widest">Workspace</h1>
                {editingProject && <span className="special-elite text-xs text-gray-500">Editing ID: {editingProject}</span>}
            </div>

            {/* Metadata row */}
            <div className="flex flex-col gap-3 mb-3">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Document Title"
                       className="w-full p-3 text-lg font-bold" style={{ border: "1px solid var(--divider)", background: "var(--surface)", color: "var(--text)" }} />
                <div className="flex gap-3">
                    <input value={date} onChange={e => setDate(e.target.value)}
                           className="flex-1 p-3 text-sm special-elite" style={{ border: "1px solid var(--divider)", background: "var(--surface)", color: "var(--text)" }} />
                    <select value={status} onChange={e => setStatus(e.target.value)}
                            className="p-3 text-sm special-elite" style={{ border: "1px solid var(--divider)", background: "var(--surface)", color: "var(--text)", width: "130px" }}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
            </div>

            {/* Flairs row */}
            <div className="flex flex-wrap gap-2 mb-4 items-center">
                <span className="special-elite text-xs uppercase" style={{ color: "#666", letterSpacing: "1px" }}>Flairs:</span>
                {flairs.map(f => (
                    <span key={f} className="special-elite text-xs px-2 py-0.5 flex items-center gap-1"
                          style={{ background: accent, color: "#fff" }}>
                        {f}
                        <button onClick={() => setFlairs(prev => prev.filter(x => x !== f))}
                                className="cursor-pointer leading-none" style={{ color: "#fff", background: "none", border: "none", fontSize: "14px", lineHeight: 1 }}>×</button>
                    </span>
                ))}
                <input value={flairInput} onChange={e => setFlairInput(e.target.value)}
                       onKeyDown={e => e.key === "Enter" && addFlair()}
                       placeholder="Add flair..." className="p-1 text-xs special-elite"
                       style={{ border: "1px solid var(--divider)", background: "var(--input-bg)", color: "var(--text)", width: "110px", outline: "none" }} />
                <button onClick={addFlair} className="special-elite text-xs px-2 py-1 cursor-pointer"
                        style={{ background: "#222", color: "#fff", border: "none" }}>+</button>
            </div>

            {/* Editor */}
            <div style={{ background: "var(--editor-wrap)", border: "1px solid var(--toolbar-bdr)", borderRadius: "4px" }}>
                <div className="md:sticky md:top-14 z-40 flex flex-nowrap md:flex-wrap gap-0.5 md:gap-1 p-1.5 md:p-2 items-center overflow-x-auto"
                     style={{ background: "var(--toolbar-bg)", borderBottom: "1px solid var(--toolbar-bdr)", borderRadius: "4px 4px 0 0" }}>
                    {editor && (
                        <>
                            <div className="flex gap-0.5 md:gap-1 pr-1.5 md:pr-2 mr-1.5 md:mr-2" style={{ borderRight: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                                {tbBtn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
                                {tbBtn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
                                {tbBtn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"))}
                                {tbBtn("S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"))}
                            </div>
                            <div className="flex gap-0.5 md:gap-1 pr-1.5 md:pr-2 mr-1.5 md:mr-2" style={{ borderRight: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                                {tbBtn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
                                {tbBtn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
                                {tbBtn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}
                                {tbBtn("P", () => editor.chain().focus().setParagraph().run(), editor.isActive("paragraph"))}
                            </div>
                            <div className="flex gap-0.5 md:gap-1 pr-1.5 md:pr-2 mr-1.5 md:mr-2" style={{ borderRight: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                                {tbBtn("←", () => editor.chain().focus().setTextAlign('left').run(), editor.isActive({ textAlign: 'left' }))}
                                {tbBtn("↔", () => editor.chain().focus().setTextAlign('center').run(), editor.isActive({ textAlign: 'center' }))}
                                {tbBtn("→", () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({ textAlign: 'right' }))}
                                {tbBtn("≡", () => editor.chain().focus().setTextAlign('justify').run(), editor.isActive({ textAlign: 'justify' }))}
                            </div>
                            <div className="flex gap-0.5 md:gap-1 pr-1.5 md:pr-2 mr-1.5 md:mr-2" style={{ borderRight: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                                {tbBtn("•—", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
                                {tbBtn("1.", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
                                {tbBtn("❝", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
                            </div>
                            <div className="flex gap-0.5 md:gap-1 pr-1.5 md:pr-2 mr-1.5 md:mr-2" style={{ borderRight: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
                                {tbBtn("<>", () => editor.chain().focus().toggleCode().run(), editor.isActive("code"))}
                                {tbBtn("</>", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"))}
                            </div>
                            <div className="flex gap-0.5 md:gap-1" style={{ flexShrink: 0 }}>
                                {tbBtn("Link", setLink, editor.isActive("link"))}
                                {tbBtn("Img", () => { const url = window.prompt('Image URL'); if (url) editor.chain().focus().setImage({ src: url }).run(); })}
                                {tbBtn("YT", () => { const url = window.prompt("YouTube URL:"); if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run(); })}
                                {tbBtn("Vid", () => videoInputRef.current?.click())}
                            </div>
                            <div className="hidden md:block text-xs ml-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
                                {uploadingVideo ? "Uploading video..." : uploadingImage ? "Uploading..." : "Drag/Paste images supported"}
                            </div>
                        </>
                    )}
                </div>
                <div className="p-3 md:p-8 mx-auto my-2 md:my-4 shadow-sm" style={{ maxWidth: "850px", border: "1px solid var(--divider)", minHeight: "400px", background: "var(--surface)" }}>
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-4 items-center">
                <button onClick={save} disabled={saving} className="special-elite uppercase text-xs tracking-widest px-6 py-3 cursor-pointer text-white"
                        style={{ background: accent, opacity: saving ? 0.7 : 1 }}>
                    {saving ? "Saving..." : "Commit Document"}
                </button>
                <button onClick={clearEditor} className="special-elite uppercase text-xs tracking-widest px-6 py-3 cursor-pointer"
                        style={{ border: "2px solid var(--border)", color: "var(--text)", background: "transparent" }}>
                    Start Fresh
                </button>
                {saveMsg && <span className="special-elite text-sm text-green-700 ml-2">{saveMsg}</span>}
            </div>

            {/* Document Registry */}
            <div className="mt-16 pt-8" style={{ borderTop: "3px solid var(--border)" }}>
                <h3 className="special-elite text-sm uppercase mb-6 tracking-widest" style={{ color: accent }}>// Document Registry</h3>
                <div className="grid gap-2">
                    {sorted.map(p => (
                        <div key={p.id} className="flex justify-between items-center p-4" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                            <div>
                                <span className="font-bold text-lg mr-3" style={{ color: "var(--text)" }}>{p.title}</span>
                                {p.status === "draft" && <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 font-mono">DRAFT</span>}
                                {parseFlairs(p.flairs).length > 0 && (
                                    <span className="ml-2 text-xs special-elite" style={{ color: accent }}>
                                        [{parseFlairs(p.flairs).join(", ")}]
                                    </span>
                                )}
                                <div className="text-sm text-gray-500 mt-1 font-mono">{p.date} · ID: {p.id}</div>
                            </div>
                            <div className="flex gap-3 special-elite text-sm">
                                <button onClick={() => setEditingProject(p.id)} className="hover:underline text-blue-700">Load</button>
                                <button onClick={() => togglePublish(p.id, p.status)} className="hover:underline">
                                    {p.status === "published" ? "Unpublish" : "Publish"}
                                </button>
                                <button onClick={() => deleteProject(p.id)} className="hover:underline text-red-600">Drop</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gallery Management */}
            <div className="mt-16 pt-8" style={{ borderTop: "3px solid var(--border)" }}>
                <h3 className="special-elite text-sm uppercase mb-6 tracking-widest" style={{ color: accent }}>// Personal Gallery</h3>

                <div className="flex gap-3 mb-6 items-center flex-wrap">
                    <input value={galleryCaption} onChange={e => setGalleryCaption(e.target.value)}
                           placeholder="Caption (optional)" className="p-2 text-sm special-elite"
                           style={{ border: "1px solid var(--divider)", background: "var(--input-bg)", color: "var(--text)", width: "220px" }} />
                    <label className="special-elite uppercase text-xs tracking-widest px-4 py-2 cursor-pointer text-white"
                           style={{ background: uploadingGallery ? "var(--sub)" : accent, border: "2px solid var(--border)" }}>
                        {uploadingGallery ? "Uploading..." : "Upload Photos"}
                        <input type="file" accept="image/*" multiple className="hidden"
                               onChange={e => { if (e.target.files?.length) uploadGalleryImages(Array.from(e.target.files)); e.target.value = ""; }}
                               disabled={uploadingGallery} />
                    </label>
                </div>

                {galleryImages.length > 0 && (
                    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                        {galleryImages.map(img => (
                            <div key={img.id} style={{ position: "relative", border: `2px solid ${accent}`, aspectRatio: "4/3", overflow: "hidden" }}>
                                <img src={img.url} alt={img.caption || ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                {img.caption && (
                                    <div className="special-elite text-xs px-1 py-0.5 absolute bottom-0 left-0 right-0"
                                         style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>{img.caption}</div>
                                )}
                                <button onClick={() => deleteGalleryImage(img.id)}
                                        className="absolute top-1 right-1 special-elite text-xs cursor-pointer"
                                        style={{ background: "#fff", border: `1px solid ${accent}`, color: accent, width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                   onChange={async e => {
                       const file = e.target.files?.[0];
                       if (file) {
                           const url = await handleVideoUpload(file);
                           if (url) editor?.chain().focus().insertVideo(url).run();
                       }
                       e.target.value = "";
                   }} />

            <style>{`
                .ProseMirror { outline: none; color: var(--text); }
                .ProseMirror p { margin-bottom: 1em; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1em; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1em; }
                .ProseMirror li { margin-bottom: 0.25em; }
                .ProseMirror img { max-width: 100%; height: auto; display: block; }
                .ProseMirror img.ProseMirror-selectednode { outline: 3px solid ${accent}; }
                .ProseMirror blockquote { border-left: 4px solid var(--divider); padding-left: 1rem; color: var(--sub); }
                .ProseMirror a { color: ${accent}; text-decoration: underline; cursor: pointer; }
                .ProseMirror iframe { border-radius: 4px; border: 2px solid var(--border); }
                .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 { color: var(--text); }
                .ProseMirror code { font-family: monospace; background: var(--toolbar-bg); border: 1px solid var(--divider); padding: 1px 5px; border-radius: 3px; font-size: 0.875em; }
                .ProseMirror pre { background: #1e1e1e; color: #d4d4d4; font-family: monospace; font-size: 0.875em; padding: 16px; border-radius: 4px; overflow-x: auto; margin: 16px 0; }
                .ProseMirror pre code { background: none; border: none; padding: 0; font-size: inherit; color: inherit; }
            `}</style>
        </div>
    );
}
