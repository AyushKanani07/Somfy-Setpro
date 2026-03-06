import { useAppDispatch, useAppSelector } from "./redux";
import {
  setLoading,
  setError,
  setProjects,
  fetchProjectsThunk,
  openCreateProjectDialog,
  closeCreateProjectDialog,
  openImportProjectDialog,
  closeImportProjectDialog,
  createProjectThunk,
  importProjectThunk,
  deleteProjectThunk,
  updateLastOpenedThunk,
  setSelectedProject,
  updateProjectThunk,
  fetchDashboardCountThunk,
  fetchLastGroupAddressThunk,
  updateLastGroupAddressThunk,
  closeRestoreConfirmDialog,
  openRestoreConfirmDialog,
} from "../store/slices/projectSlice";
import type { CreateProjectPayload, Project } from "~/interfaces/project";

export const useProject = () => {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.project);

  // #region Actions
  const actions = {
    setLoading: (loading: boolean) => dispatch(setLoading(loading)),
    setError: (error: string | null) => dispatch(setError(error)),
    setProjects: (projects: Project[]) => dispatch(setProjects(projects)),
    openCreateProjectDialog: () => dispatch(openCreateProjectDialog()),
    closeCreateProjectDialog: () => dispatch(closeCreateProjectDialog()),
    openImportProjectDialog: () => dispatch(openImportProjectDialog()),
    closeImportProjectDialog: () => dispatch(closeImportProjectDialog()),
    openRestoreConfirmDialog: () => dispatch(openRestoreConfirmDialog()),
    closeRestoreConfirmDialog: () => dispatch(closeRestoreConfirmDialog()),
    setSelectedProject: (project: Project | null) =>
      dispatch(setSelectedProject(project)),
  };

  // #region Helpers
  const helpers = {
    getProjectById: (id: string) =>
      projects.projects.find((project) => project.project_id === id),
  };

  // #region Thunks
  const thunks = {
    fetchProjects: () => dispatch(fetchProjectsThunk()),
    createProject: (projectData: CreateProjectPayload) =>
      dispatch(createProjectThunk(projectData)),
    importProject: (file: File) => dispatch(importProjectThunk(file)),
    updateLastOpened: (projectId: string) =>
      dispatch(updateLastOpenedThunk(projectId)),
    updateProject: (payload: {
      projectId: string;
      projectData: CreateProjectPayload;
    }) => dispatch(updateProjectThunk(payload)),
    deleteProject: (projectId: string) =>
      dispatch(deleteProjectThunk(projectId)),
    fetchDashboardCount: () => dispatch(fetchDashboardCountThunk()),
    fetchLastGroupAddress: () =>
      dispatch(fetchLastGroupAddressThunk()),
    updateLastGroupAddress: (payload: { address: string }) =>
      dispatch(updateLastGroupAddressThunk(payload)),
  };

  return {
    // State
    ...projects,

    // Actions
    ...actions,

    // Helper functions
    ...helpers,

    // Thunks
    ...thunks,
  };
};
