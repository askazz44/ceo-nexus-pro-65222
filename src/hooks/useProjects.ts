import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Project, ProjectWithTransactions } from '@/types/project';

export function useProjects(includeTransactions = false) {
  const [projects, setProjects] = useState<Project[] | ProjectWithTransactions[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      if (includeTransactions) {
        const { data, error } = await supabase
          .from('projects')
          .select('*, transactions(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data as ProjectWithTransactions[] || []);
      } else {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects(data as Project[] || []);
      }
    } catch (error: any) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeTransactions]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { projects, loading, refetch: loadProjects };
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      console.error('Error loading project:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  return { project, loading, refetch: loadProject };
}
