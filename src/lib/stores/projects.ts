import { create } from "zustand";

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

type ProjectsStore = {
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
};

export const useProjectsStore = create<ProjectsStore>((set) => ({
  projects: [],
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, project) => set((state) => ({ projects: state.projects.map((p) => p.id === id ? { ...p, ...project } : p) })),
  deleteProject: (id) => set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
}));

export const useAllProjects = () => {
  const { projects } = useProjectsStore();
  return projects;
};

export const useProject = (id: string) => {
  const { projects } = useProjectsStore();
  return projects.find((p) => p.id === id);
};
