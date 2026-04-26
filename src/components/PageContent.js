import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import ProjectsPage from "../pages/ProjectsPage";
import GalleryPage from "../pages/GalleryPage";
import ResumePage from "../pages/ResumePage";
import ContactPage from "../pages/ContactPage";
export default function PageContent({ page, accent, accentDark, published, navigate, openProject, viewingProject, setViewingProject }) {
    switch (page) {
        case "home":     return <HomePage accent={accent} accentDark={accentDark} published={published} navigate={navigate} openProject={openProject} />;
        case "about":    return <AboutPage accent={accent} navigate={navigate} />;
        case "projects": return <ProjectsPage accent={accent} published={published} openProject={openProject} viewingProject={viewingProject} setViewingProject={setViewingProject} />;
        case "gallery":  return <GalleryPage accent={accent} published={published} />;
        case "resume":   return <ResumePage accent={accent} />;
        case "contact":  return <ContactPage accent={accent} />;
        default:         return null;
    }
}
