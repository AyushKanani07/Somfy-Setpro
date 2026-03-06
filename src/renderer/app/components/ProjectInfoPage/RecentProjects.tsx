import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { SELECTED_PROJECT_KEY } from "~/constant/constant";
import { useProject } from "~/hooks";
import { connectSocket } from "~/services/socketService";
import { sessionStorageService } from "~/services/storageService";
import ProjectCard from "./ProjectCard";

function RecentProjects() {
  const {
    projects,
    lastOpenedUpdatedLoading,
    deleteProject,
    updateLastOpened,
    setSelectedProject,
  } = useProject();
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Local search filtering
  const filteredProjects = useMemo(() => {
    if (!searchText.trim()) {
      return projects;
    }

    const query = searchText.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.address?.toLowerCase().includes(query)
    );
  }, [projects, searchText]);

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
  };

  const handleContinue = async (projectId: string) => {
    const updatedResult = await updateLastOpened(projectId).unwrap();

    if (updatedResult.selected === true) {
      navigate("/dashboard");
      setSelectedProject(updatedResult);
      connectSocket();
      sessionStorageService.setItem(SELECTED_PROJECT_KEY, updatedResult);
    }
  };

  return (
    <div className="w-full flex flex-col justify-start items-start gap-6">
      {/* title */}
      <div className="w-full flex justify-between items-center">
        <h3 className="text-xl text-textDarkColor font-semibold">
          Recent Projects
        </h3>
        <div
          className={`flex justify-start items-center gap-4 rounded-full border border-borderColor px-4 py-2`}
        >
          <Search size={14} className="text-textDarkColor flex-shrink-0" />
          <input
            type="text"
            value={searchText}
            placeholder={"Search projects..."}
            onChange={(e) => setSearchText(e.target.value)}
            disabled={false}
            className="bg-transparent text-sm flex-1 focus:outline-none text-textDarkColor placeholder:text-gray-400"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              disabled={false}
              className="text-textDarkColor hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* projects grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {filteredProjects && filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.project_id}
              project={project}
              handleDelete={handleDeleteProject}
              handleContinue={handleContinue}
              loading={lastOpenedUpdatedLoading}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchText ? "No projects match your search" : "No projects yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentProjects;
