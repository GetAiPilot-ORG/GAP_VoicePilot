import { 
  WorkflowEngine, 
  TemplateInterpolator, 
  WorkflowDefinition 
} from '../index';
import { NormalizedVoicePilotEvent } from '../../events/types';
import { ConnectorRegistry } from '../../connectors/core/ConnectorRegistry';
import { SlackConnector } from '../../connectors/providers/slack/SlackConnector';
import { GmailConnector } from '../../connectors/providers/gmail/GmailConnector';
import { CredentialManager } from '../../connectors/core/CredentialManager';

async function runWorkflowEngineTestSuite() {
  console.log('====================================================');
  console.log('Running VoicePilot Workflow Engine Tests');
  console.log('====================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || 'Assertion failed'}`);
      failedTests++;
    }
  }

  // Ensure Registry has Slack and Gmail registered
  const registry = ConnectorRegistry.getInstance();
  if (!registry.getConnector('slack')) registry.registerConnector(new SlackConnector());
  if (!registry.getConnector('gmail')) registry.registerConnector(new GmailConnector());

  const engine = WorkflowEngine.getInstance();
  const testWorkspaceId = 'ws_workflow_test_999';

  // Sample Normalized Event
  const sampleEvent: NormalizedVoicePilotEvent = {
    event_id: `evt_test_wf_${Date.now()}`,
    event_type: 'call.completed',
    provider: 'vomyra',
    provider_event_id: 'vom_call_99',
    timestamp: new Date().toISOString(),
    workspace_id: testWorkspaceId,
    assistant_id: 'ast_test_01',
    call_id: 'call_test_01',
    customer: {
      name: 'Sarah Customer',
      phone: '+15559998888',
    },
    call: {
      duration_seconds: 150,
      status: 'completed',
      ended_reason: 'normal',
      cost: 0.20,
    },
    transcript: 'Customer wants a quote.',
    transcript_url: 'https://api.vomyra.com/transcripts/99.txt',
    recording_url: 'https://api.vomyra.com/recordings/99.mp3',
    summary: 'Lead requested custom enterprise demo.',
    outcome: 'lead_qualified',
  };

  // Test 1: Template Variable Interpolation
  const rawConfig = {
    channel: '#general',
    text: 'Call summary: {{summary}} | Customer: {{customer.name}} ({{customer.phone}})',
  };

  const interpolated = TemplateInterpolator.interpolate(rawConfig, sampleEvent);

  assert(
    interpolated.text === 'Call summary: Lead requested custom enterprise demo. | Customer: Sarah Customer (+15559998888)',
    'Test 1: Template Variable Interpolation',
    `Result: ${interpolated.text}`
  );

  // Test 2: Condition Evaluation
  const condMatch = engine.evaluateConditions({ min_duration: 60, outcome: 'lead_qualified' }, sampleEvent);
  const condFail = engine.evaluateConditions({ min_duration: 300 }, sampleEvent);

  assert(
    condMatch && !condFail,
    'Test 2: Condition Evaluation Rules',
    `Match: ${condMatch}, Fail: ${!condFail}`
  );

  // Setup Mock DB Store for Execution
  const mockEncryptedSlackCreds = CredentialManager.encrypt({ access_token: 'xoxb-mock-slack-token-99' });
  const mockDbStore = {
    workspaceConnectors: [
      {
        id: 'conn_slack_wf',
        workspace_id: testWorkspaceId,
        connector_definition_id: 'def_slack',
        status: 'connected',
        encrypted_access_token: mockEncryptedSlackCreds,
      },
    ],
    assistantConnectors: [
      { assistant_id: 'ast_test_01', workspace_connector_id: 'conn_slack_wf', enabled: true },
    ],
    toolPermissions: [
      { workspace_connector_id: 'conn_slack_wf', assistant_id: null, tool_name: 'slack.send_message', enabled: true, execution_policy: 'automatic' },
    ],
  };

  // Test 3: Workflow Triggering & Action Execution
  const sampleWorkflow: WorkflowDefinition = {
    id: 'wf_001',
    workspace_id: testWorkspaceId,
    name: 'Post Call Summary to Slack',
    enabled: true,
    trigger_type: 'call.completed',
    conditions: { min_duration: 10 },
    actions: [
      {
        id: 'act_01',
        tool_name: 'slack.send_message',
        config: {
          channel: '#general',
          text: 'Call completed! Summary: {{summary}}',
        },
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const summaries = await engine.handleIncomingEvent(sampleEvent, {
    mockWorkflows: [sampleWorkflow],
    bypassDbChecks: true,
    mockDbStore,
  });

  assert(
    summaries.length === 1 &&
    summaries[0].status === 'completed' &&
    summaries[0].action_results[0].success,
    'Test 3: Workflow Triggering & Action Execution',
    `Summary: ${JSON.stringify(summaries)}`
  );

  // Test 4: Per-Action Failure Isolation
  const multiActionWorkflow: WorkflowDefinition = {
    id: 'wf_002',
    workspace_id: testWorkspaceId,
    name: 'Multi-Action Workflow with Failing Action 1',
    enabled: true,
    trigger_type: 'call.completed',
    actions: [
      {
        id: 'act_failing',
        tool_name: 'non_existent_tool', // Will fail
        config: {},
      },
      {
        id: 'act_passing',
        tool_name: 'slack.send_message', // Will succeed
        config: { channel: '#alerts', text: 'Action 2 succeeded' },
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const isolatedEvent = { ...sampleEvent, event_id: `evt_iso_${Date.now()}` };
  const isolatedSummaries = await engine.handleIncomingEvent(isolatedEvent, {
    mockWorkflows: [multiActionWorkflow],
    bypassDbChecks: true,
    mockDbStore,
  });

  assert(
    isolatedSummaries.length === 1 &&
    isolatedSummaries[0].status === 'partial_failure' &&
    !isolatedSummaries[0].action_results[0].success &&
    isolatedSummaries[0].action_results[1].success,
    'Test 4: Per-Action Failure Isolation (Action 2 runs even if Action 1 fails)',
    `Action results: ${JSON.stringify(isolatedSummaries[0]?.action_results)}`
  );

  // Test 5: Disabled Workflow Protection & Tenant Isolation
  const disabledWorkflow: WorkflowDefinition = {
    id: 'wf_003',
    workspace_id: testWorkspaceId,
    name: 'Disabled Rule',
    enabled: false,
    trigger_type: 'call.completed',
    actions: [{ id: 'a1', tool_name: 'slack.send_message', config: {} }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const otherWorkspaceWorkflow: WorkflowDefinition = {
    id: 'wf_004',
    workspace_id: 'ws_other_workspace',
    name: 'Other Tenant Rule',
    enabled: true,
    trigger_type: 'call.completed',
    actions: [{ id: 'a1', tool_name: 'slack.send_message', config: {} }],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const protectionEvent = { ...sampleEvent, event_id: `evt_prot_${Date.now()}` };
  const protectionSummaries = await engine.handleIncomingEvent(protectionEvent, {
    mockWorkflows: [disabledWorkflow, otherWorkspaceWorkflow],
    bypassDbChecks: true,
    mockDbStore,
  });

  assert(
    protectionSummaries.length === 0,
    'Test 5: Disabled Workflow Protection & Tenant Isolation',
    `Executed workflows count: ${protectionSummaries.length}`
  );

  console.log('\n----------------------------------------------------');
  console.log(`Workflow Engine Test Suite Finished: ${passedTests} passed, ${failedTests} failed.`);
  console.log('----------------------------------------------------\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runWorkflowEngineTestSuite().catch((err) => {
  console.error('Unhandled Workflow test error:', err);
  process.exit(1);
});
