import { Router, Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../config/supabase';

export const workflowRouter = Router();

// GET /api/v1/workflows - List Workflows for Workspace
workflowRouter.get('/', async (req: Request, res: Response) => {
  try {
    const workspaceId = String(req.query.workspaceId || '');
    if (!workspaceId) {
      return res.status(400).json({ success: false, error: 'workspaceId query parameter is required' });
    }

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, workflows: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/workflows - Create New Workflow
workflowRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { workspace_id, name, description, trigger_type, actions, conditions, enabled } = req.body;

    if (!workspace_id || !name || !trigger_type || !actions || !Array.isArray(actions)) {
      return res.status(400).json({
        success: false,
        error: 'workspace_id, name, trigger_type, and actions array are required',
      });
    }

    const { data, error } = await supabase
      .from('workflows')
      .insert({
        workspace_id,
        name,
        description: description || null,
        trigger_type,
        enabled: enabled ?? true,
        conditions: conditions || {},
        actions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, workflow: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/workflows/:id - Update Workflow
workflowRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, trigger_type, actions, conditions, enabled } = req.body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (trigger_type !== undefined) updatePayload.trigger_type = trigger_type;
    if (actions !== undefined) updatePayload.actions = actions;
    if (conditions !== undefined) updatePayload.conditions = conditions;
    if (enabled !== undefined) updatePayload.enabled = enabled;

    const { data, error } = await supabase
      .from('workflows')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, workflow: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/workflows/:id - Delete Workflow
workflowRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('workflows').delete().eq('id', id);

    if (error) throw error;

    return res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/workflows/:id/logs - Get Execution Logs for Workflow
workflowRouter.get('/:id/logs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('workflow_execution_logs')
      .select('*')
      .eq('workflow_id', id)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return res.json({ success: true, logs: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
