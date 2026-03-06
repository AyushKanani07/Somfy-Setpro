import { Trash } from "lucide-react";
import type { Project } from "~/interfaces/project";
import { formatLastOpened } from "~/utils/helperFunctions";
import LoaderComponent from "../sharedComponent/LoaderComponent";

interface ProjectCardProps {
  project: Project;
  handleDelete: (projectId: string) => void;
  handleContinue: (projectId: string) => void;
  loading: { loading: boolean; projectId: string | null };
}

function ProjectCard({
  project,
  handleDelete,
  handleContinue,
  loading,
}: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl border border-black/10 shadow-none p-6 flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
      {/* Header with icon and delete button */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-4xl">🏢</div>
        <button
          className="rounded-full bg-deleteButtonColor/10 hover:text-red-700 p-1.5"
          onClick={() => handleDelete(project.project_id)}
        >
          <Trash
            size={16}
            className="text-deleteButtonColor fill-deleteButtonColor"
          />
        </button>
      </div>

      {/* Project title and address */}
      <div className="mb-4 flex-grow">
        <h3 className="text-lg font-semibold text-textDarkColor mb-2 line-clamp-2">
          {project.name}
        </h3>
        <p className="text-sm text-textDarkColor line-clamp-2">
          {project.address || "N/A"}
        </p>
      </div>

      {/* Last opened */}
      <div className="mb-12">
        <p className="text-xs text-textDarkColor">
          Last Opened : {formatLastOpened(project.last_opened)}
        </p>
      </div>

      {/* Continue button */}
      <button
        className="w-full flex justify-center items-center gap-2 bg-buttonColor hover:bg-buttonHoverColor/80 text-white font-semibold py-2 px-4 rounded-full transition-colors cursor-pointer"
        onClick={() => handleContinue(project.project_id)}
        disabled={loading.loading && loading.projectId === project.project_id}
      >
        {loading.loading && loading.projectId === project.project_id ? (
          <LoaderComponent size={24} />
        ) : (
          <span>Continue</span>
        )}
      </button>
    </div>
  );
}

export default ProjectCard;
