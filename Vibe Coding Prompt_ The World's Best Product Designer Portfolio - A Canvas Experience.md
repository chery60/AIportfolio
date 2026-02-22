# Vibe Coding Prompt: The World's Best Product Designer Portfolio - A Canvas Experience

## Vision

Create a groundbreaking online portfolio for a product designer that redefines the traditional showcase. This portfolio will emulate the intuitive and collaborative canvas experience of leading design and product management tools like Figma, FigJam, Miro, and Coda. The core idea is to immerse visitors in an interactive, dynamic environment where each project is a living, breathing canvas, offering a deep dive into the designer's process, thinking, and output. The goal is to create a "world's best" portfolio that is not just a display of work, but an interactive product experience in itself.

## Core Experience & Features

### 1. Layout Structure (Inspired by Figma/FigJam)

The portfolio will feature a three-panel layout with a central, expansive canvas, flanked by a left navigation panel and a right interaction/property panel. A contextual toolbar will reside at the bottom.

#### 1.1. Left Navigation Panel (Project & Asset Management)

*   **Project List:** A scrollable list of the product designer's projects. Each item in the list represents a distinct project, acting as a "page" in the portfolio. Clicking a project loads its dedicated canvas in the central area.
*   **Project Title & Description:** Clearly display the currently selected project's title and a brief description at the top of this panel.
*   **Tabs (File/Assets):** Implement two tabs: "File" (for project-specific documents, links, or external resources) and "Assets" (for visual assets, mockups, illustrations, or components related to the current project). The "Assets" tab should display a grid of small, clickable image previews, similar to the reference image.
*   **Search/Filter:** A search bar at the bottom of the panel to quickly find projects or assets within the portfolio.

#### 1.2. Central Canvas (The Interactive Project Workspace)

*   **Infinite Canvas:** An expansive, zoomable, and pannable canvas where the entirety of a selected project's content resides. This should feel limitless, allowing for non-linear exploration of project details.
*   **Project Content:** This canvas will host various elements representing the project: case studies, wireframes, prototypes (embeddable), user flows, research findings, design iterations, and final designs. These elements should be freely movable, resizable, and connectable (if applicable, e.g., for user flows).
*   **Interactive Elements:** Each project canvas will contain unique interactive elements or mini-games designed to engage visitors and demonstrate specific design principles or problem-solving approaches. These interactions should be contextually relevant to the project.
*   **Visual Fidelity:** The canvas should maintain high visual fidelity, rendering design assets and text clearly, similar to a professional design tool.

#### 1.3. Right Interaction & Property Panel (Real-time Engagement & Contextual Tools)

*   **Real-time Viewer Presence:** Display avatars or anonymous indicators of other users currently viewing the portfolio, similar to collaborative design tools. This creates a sense of shared experience.
*   **Engagement Tools:** A suite of interactive tools for visitors to engage with the designer and the content:
    *   **Contact:** A clear call-to-action or form to contact the designer.
    *   **Ask Questions/Comments:** A mechanism for visitors to leave comments or ask questions directly on specific parts of the canvas or the project as a whole. This could involve pinning comments to specific elements.
    *   **Share Love/Reactions:** Simple, intuitive ways for visitors to express appreciation (e.g., a "like" button, emoji reactions).
    *   **Share:** Functionality to easily share the portfolio or specific project links.
*   **Contextual Properties/Information:** When an element on the canvas is selected, this panel should dynamically update to show relevant properties or information about that element (e.g., dimensions, colors, descriptions, links). This mirrors the property inspector in design tools.

#### 1.4. Bottom Contextual Toolbar (Project-Specific Actions)

*   **Dynamic Tools:** This toolbar will display only the tools and actions relevant to the currently selected project and the elements within its canvas. For example, if a prototype is embedded, playback controls might appear. If an interactive game is present, game-specific controls would show.
*   **Common Actions:** Include universal actions like zoom controls, undo/redo (if applicable to canvas interactions), and an "Export" option (e.g., to download a PDF summary of the project).

## Technical Considerations & Vibe

*   **Frontend Framework:** React.js for a component-based, dynamic UI.
*   **Styling:** Tailwind CSS for rapid and consistent styling, ensuring a clean, modern, and minimalist aesthetic.
*   **Canvas Implementation:** Explore libraries like `react-konva` [1] or `react-flow` [2] for building the infinite canvas. Prioritize smooth panning, zooming, and efficient rendering of numerous elements.
*   **Real-time Features:** Implement real-time presence and commenting using WebSockets, potentially leveraging solutions like `Socket.IO` or `Supabase Realtime` [3]. This is crucial for the collaborative "vibe."
*   **Backend (Minimal):** A lightweight backend might be needed for storing comments, reactions, and potentially project data, or for handling contact forms. Serverless functions could be a good fit.
*   **Data Structure:** Projects should be easily configurable, allowing the designer to define canvas elements, their positions, and associated interactive components.
*   **Performance:** Optimize for smooth interactions and fast loading times, even with complex project canvases.
*   **Responsiveness:** While the primary experience is desktop-focused, consider how the portfolio might adapt or offer a simplified view on smaller screens.
*   **Aesthetic & UX:** The overall "vibe" should be professional, elegant, and highly intuitive. The interface should feel familiar to anyone who has used modern design tools, minimizing the learning curve for interaction.

## Deliverables

A functional web application demonstrating the core canvas experience with at least one example project, including:
*   The three-panel layout with a central infinite canvas.
*   Basic project navigation from the left panel.
*   Example content on the canvas (e.g., text blocks, images, embedded prototypes).
*   Real-time viewer presence (even if simulated with dummy data).
*   Placeholder engagement tools on the right panel.
*   A dynamic bottom toolbar that changes based on selected canvas elements.

## References

[1] konvajs/react-konva: React + Canvas = Love. JavaScript ... - GitHub. (n.d.). Retrieved from https://github.com/konvajs/react-konva
[2] Built a lightweight infinite canvas for React - Reddit. (n.d.). Retrieved from https://www.reddit.com/r/reactjs/comments/1jmg3ub/built_a_lightweight_infinite_canvas_for_react/
[3] Realtime - Presence | Supabase Features. (n.d.). Retrieved from https://supabase.com/features/realtime-presence
