import React from 'react';
import { Project } from '../../types';
import { ProjectPreviewImage } from './ProjectPreviewImage';
import { ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onViewDetails }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewDetails(project.id);
  };

  return (
    <article
      onClick={handleClick}
      className="group cursor-pointer rounded-2xl bg-[#140e0b]/85 border border-white/[0.08] hover:border-sky-400/40 hover:bg-[#18110d] card-hover-fx hover:shadow-2xl hover:shadow-black/80 flex flex-col justify-between overflow-hidden"
      aria-label={`View details for ${project.name}`}
    >
      <div>
        {/* Website Preview Container with subtle zoom */}
        <div className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="transition-transform duration-500 ease-out group-hover:scale-[1.03]">
            <ProjectPreviewImage project={project} />
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            {project.category && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-sky-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" aria-hidden="true" />
                {project.category}
              </span>
            )}
            {project.price && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[11px] font-bold text-amber-300">
                {project.price}
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-sky-200 transition-colors">
            {project.name}
          </h3>

          {project.description && (
            <p className="text-sm text-stone-300 leading-relaxed line-clamp-2 font-normal">
              {project.description}
            </p>
          )}

          {/* Technology Badges with micro-hover */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-stone-400 group-hover:border-sky-400/25 group-hover:text-stone-300 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer with View Details CTA */}
      <div className="px-6 sm:px-7 pb-6 pt-2">
        <button
          type="button"
          onClick={handleClick}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-sky-500/15 text-stone-200 hover:text-sky-300 border border-white/[0.08] hover:border-sky-400/35 text-sm font-semibold btn-micro-fx"
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
        </button>
      </div>
    </article>
  );
};
