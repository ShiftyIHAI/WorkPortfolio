const PROJECTS = {
  project1100: { title: "Content Planner", src: "projects/project1100/index.html" },
  pokecard: { title: "PokéPack Simulator", src: "projects/pokecard/index.html" },
  steambacklog: { title: "Steam Backlog RPG", src: "projects/steambacklog/index.html" },
  urate: { title: "URate", src: "projects/urate/index.html" },
};

const overlay = document.getElementById("viewer-overlay");
const frame = document.getElementById("viewer-frame");
const viewerTitle = document.getElementById("viewer-title");
const backBtn = document.getElementById("viewer-back");

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", () => {
    const project = PROJECTS[card.dataset.project];
    if (!project) return;
    viewerTitle.textContent = project.title;
    frame.src = project.src;
    overlay.hidden = false;
  });
});

backBtn.addEventListener("click", () => {
  overlay.hidden = true;
  frame.src = "";
});
