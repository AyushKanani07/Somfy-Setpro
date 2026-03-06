import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { toast } from "sonner";
import { SELECTED_PROJECT_KEY } from "~/constant/constant";
import type {
  CreateProjectPayload,
  DashboardCount,
  Project,
} from "~/interfaces/project";
import { projectService } from "~/services/projectService";
import { sessionStorageService } from "~/services/storageService";
import { getAxiosMessage } from "~/utils/helperFunctions";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  createProjectDialog: boolean;
  importProjectDialog: boolean;
  restoreConfirmDialog: boolean;
  importProjectLoading: boolean;
  lastOpenedUpdatedLoading: { loading: boolean; projectId: string | null };
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  dashboardCount: DashboardCount | null;
  lastGroupAddress: string | null;
}

//#region initial state
const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  createProjectDialog: false,
  importProjectDialog: false,
  restoreConfirmDialog: false,
  importProjectLoading: false,
  lastOpenedUpdatedLoading: { loading: false, projectId: null },
  selectedProject: sessionStorageService.getItem(SELECTED_PROJECT_KEY),
  loading: false,
  error: null,
  dashboardCount: null,
  lastGroupAddress: null,
};

//#region fetch projects thunk
export const fetchProjectsThunk = createAsyncThunk(
  "project/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjects();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region import project thunk
export const importProjectThunk = createAsyncThunk(
  "project/importProject",
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await projectService.importProject(file);
      const message = getAxiosMessage(response);
      toast.success(message || "Project imported successfully");
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region create project thunk
export const createProjectThunk = createAsyncThunk(
  "project/createProject",
  async (projectData: CreateProjectPayload, { rejectWithValue }) => {
    try {
      const response = await projectService.createProject(projectData);
      const message = getAxiosMessage(response);
      toast.success(message || "Project created successfully");
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region update last opened thunk
export const updateLastOpenedThunk = createAsyncThunk(
  "project/updateLastOpened",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await projectService.updateLastOpenProject(projectId);
      const message = getAxiosMessage(response);
      toast.success(message || "Project last opened updated successfully");
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region update project thunk

export const updateProjectThunk = createAsyncThunk(
  "project/updateProject",
  async (
    payload: { projectId: string; projectData: CreateProjectPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await projectService.updateProject(
        payload.projectId,
        payload.projectData
      );
      const message = getAxiosMessage(response);
      toast.success(message || "Project updated successfully");
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

// #region delete project thunk
export const deleteProjectThunk = createAsyncThunk(
  "project/deleteProject",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await projectService.deleteProject(projectId);
      const message = getAxiosMessage(response);
      toast.success(message || "Project deleted successfully");
      return projectId;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region dashboard count thunk
export const fetchDashboardCountThunk = createAsyncThunk(
  "project/fetchDashboardCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectDashboardCount();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region get last group address thunk
export const fetchLastGroupAddressThunk = createAsyncThunk(
  "project/fetchLastGroupAddress",
  async (_, { rejectWithValue }) => {
    try {
      const response = await projectService.getLastGroupAddress();
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
);

//#region update last group address thunk
export const updateLastGroupAddressThunk = createAsyncThunk(
  "project/updateLastGroupAddress",
  async (payload: { address: string }, { rejectWithValue }) => {
    try {
      const response = await projectService.updateLastGroupAddress(
        payload.address
      );
      return response.data;
    } catch (error) {
      const errMessage = getAxiosMessage(error);
      return rejectWithValue(errMessage);
    }
  }
)

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    openCreateProjectDialog: (state) => {
      state.createProjectDialog = true;
    },
    closeCreateProjectDialog: (state) => {
      state.createProjectDialog = false;
    },
    openImportProjectDialog: (state) => {
      state.importProjectDialog = true;
    },
    closeImportProjectDialog: (state) => {
      state.importProjectDialog = false;
    },
    openRestoreConfirmDialog: (state) => {
      state.restoreConfirmDialog = true;
    },
    closeRestoreConfirmDialog: (state) => {
      state.restoreConfirmDialog = false;
    },
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
      // Also save to session storage
      if (action.payload) {
        sessionStorageService.setItem(SELECTED_PROJECT_KEY, action.payload);
      } else {
        sessionStorageService.removeItem(SELECTED_PROJECT_KEY);
      }
    },
  },
  extraReducers: (builder) => {
    //#region fetch projects builder
    builder.addCase(fetchProjectsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectsThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload;
    });
    builder.addCase(fetchProjectsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    //#region import project builder
    builder
      .addCase(importProjectThunk.pending, (state) => {
        state.importProjectLoading = true;
        state.error = null;
      })
      .addCase(importProjectThunk.fulfilled, (state, action) => {
        state.importProjectLoading = false;
        if (action.payload)
          state.projects = [action.payload, ...state.projects];
      })
      .addCase(importProjectThunk.rejected, (state, action) => {
        state.importProjectLoading = false;
        state.error = action.payload as string;
      });

    //#region create project builder
    builder
      .addCase(createProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = [action.payload, ...state.projects];
        state.createProjectDialog = false;
      })
      .addCase(createProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    //#region update last opened builder
    builder
      .addCase(updateLastOpenedThunk.pending, (state, action) => {
        state.lastOpenedUpdatedLoading = {
          loading: true,
          projectId: action.meta.arg,
        };
        state.error = null;
      })
      .addCase(updateLastOpenedThunk.fulfilled, (state) => {
        state.lastOpenedUpdatedLoading = { loading: false, projectId: null };
      })
      .addCase(updateLastOpenedThunk.rejected, (state, action) => {
        state.lastOpenedUpdatedLoading = { loading: false, projectId: null };
        state.error = action.payload as string;
      });

    // #region update project builder
    builder
      .addCase(updateProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectThunk.fulfilled, (state, action) => {
        state.loading = false;

        // Update selected project
        state.selectedProject = action.payload;

        // Update list of all projects
        state.projects = state.projects.map((p) =>
          p.project_id === action.payload.project_id ? action.payload : p
        );

        // Also update session storage
        if (state.selectedProject) {
          sessionStorage.setItem(
            SELECTED_PROJECT_KEY,
            JSON.stringify(state.selectedProject)
          );
        }
        state.createProjectDialog = false;
      })
      .addCase(updateProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // #region delete project builder
    builder
      .addCase(deleteProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(
          (project) => project.project_id !== action.payload
        );
      })
      .addCase(deleteProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // #region fetch dashboard count builder
    builder
      .addCase(fetchDashboardCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardCount = action.payload;
      })
      .addCase(fetchDashboardCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // #region fetch last group address builder
    builder
      .addCase(fetchLastGroupAddressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLastGroupAddressThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.lastGroupAddress = action.payload;
      })
      .addCase(fetchLastGroupAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // #region update last group address builder
    builder
      .addCase(updateLastGroupAddressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLastGroupAddressThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.lastGroupAddress = action.payload;
      })
      .addCase(updateLastGroupAddressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setProjects,
  openCreateProjectDialog,
  closeCreateProjectDialog,
  openImportProjectDialog,
  closeImportProjectDialog,
  openRestoreConfirmDialog,
  closeRestoreConfirmDialog,
  setSelectedProject,
} = projectSlice.actions;

export default projectSlice.reducer;
