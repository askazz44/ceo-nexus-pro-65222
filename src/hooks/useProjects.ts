import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import type { Project, ProjectWithTransactions } from '@/types/project';

export function useProjects(includeTransactions = false) {
  const [projects, setProjects] = useState<Project[] | ProjectWithTransactions[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

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
      toast({
        title: t('error'),
        description: error.message || t('unableToLoadProjects'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [includeTransactions, toast, t]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { projects, loading, refetch: loadProjects };
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      toast({
        title: t('error'),
        description: t('projectNotFound'),
        variant: 'destructive',
      });
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, toast, t]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  return { project, loading, refetch: loadProject };
}
