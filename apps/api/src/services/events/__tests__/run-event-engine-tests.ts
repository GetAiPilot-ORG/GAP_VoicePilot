import crypto from 'crypto';
import { 
  IdempotencyManager, 
  VomyraNormalizer, 
  EventBus, 
  NormalizedVoicePilotEvent 
} from '../index';

async function runEventEngineTestSuite() {
  console.log('====================================================');
  console.log('Running VoicePilot Event Engine & Vomyra Normalization Tests');
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

  const secret = 'vomyra_webhook_secret_key_12345';
  const sampleBody = JSON.stringify({ event: 'call.started', data: { call_id: 'call_test_001' } });
  const validSignature = crypto.createHmac('sha256', secret).update(sampleBody).digest('hex');

  // Test 1: Webhook Signature Verification
  const isSigValid = IdempotencyManager.verifySignature(sampleBody, validSignature, secret);
  const isSigInvalid = IdempotencyManager.verifySignature(sampleBody, 'invalid_sig', secret);

  assert(
    isSigValid && !isSigInvalid,
    'Test 1: Webhook Signature Verification',
    `Valid: ${isSigValid}, Invalid Rejected: ${!isSigInvalid}`
  );

  // Test 2: Idempotency & Duplicate Protection
  IdempotencyManager.clearCache();
  const testKey = `test_idem_call_100_${Date.now()}`;
  const firstCheck = await IdempotencyManager.isDuplicate('vomyra', testKey, 'call.started');
  const secondCheck = await IdempotencyManager.isDuplicate('vomyra', testKey, 'call.started');

  assert(
    !firstCheck && secondCheck,
    'Test 2: Event Deduplication & Idempotency',
    `First check (new): ${!firstCheck}, Second check (duplicate): ${secondCheck}`
  );

  // Test 3: Vomyra Payload Normalization (call.started)
  const vomyraStartPayload = {
    event: 'call.started',
    data: {
      call_id: 'vom_call_555',
      assistant_id: 'vom_ast_999',
      caller: { number: '+12025550143', name: 'John Call' },
      status: 'in-progress',
    },
  };

  const normalizedStartEvents = await VomyraNormalizer.normalize(vomyraStartPayload);
  const startEvt = normalizedStartEvents[0];

  assert(
    normalizedStartEvents.length === 1 &&
    startEvt.event_type === 'call.started' &&
    startEvt.call_id === 'vom_call_555' &&
    startEvt.customer.phone === '+12025550143',
    'Test 3: Vomyra Normalization (call.started)',
    `Event: ${JSON.stringify(startEvt)}`
  );

  // Test 4: Rich End-of-Call Payload & Derived Events Mappings
  const vomyraEndPayload = {
    event: 'call.ended',
    data: {
      call_id: 'vom_call_555',
      assistant_id: 'vom_ast_999',
      status: 'completed',
      ended_reason: 'normal',
      duration_seconds: 180,
      cost: 0.25,
      transcript: 'Hello, I want to buy a plan.',
      transcript_url: 'https://api.vomyra.com/transcripts/555.txt',
      recording_url: 'https://api.vomyra.com/recordings/555.mp3',
      summary: 'Customer expressed high intent to buy enterprise plan.',
      outcome: 'interested',
      caller: { number: '+12025550143', name: 'John Call' },
    },
  };

  const normalizedEndEvents = await VomyraNormalizer.normalize(vomyraEndPayload);

  const primaryCompleted = normalizedEndEvents.find((e) => e.event_type === 'call.completed');
  const transcriptReady = normalizedEndEvents.find((e) => e.event_type === 'transcript.ready');
  const recordingReady = normalizedEndEvents.find((e) => e.event_type === 'recording.ready');
  const summaryReady = normalizedEndEvents.find((e) => e.event_type === 'summary.ready');

  assert(
    normalizedEndEvents.length === 4 &&
    Boolean(primaryCompleted) &&
    Boolean(transcriptReady) &&
    Boolean(recordingReady) &&
    Boolean(summaryReady) &&
    primaryCompleted?.call.duration_seconds === 180,
    'Test 4: Rich End-of-Call Mappings & Derived Events',
    `Derived event types: ${normalizedEndEvents.map((e) => e.event_type).join(', ')}`
  );

  // Test 5: Failed Call Mappings (status = 'failed')
  const vomyraFailedPayload = {
    event: 'call.ended',
    data: {
      call_id: 'vom_call_777',
      status: 'failed',
      ended_reason: 'error',
    },
  };

  const normalizedFailedEvents = await VomyraNormalizer.normalize(vomyraFailedPayload);
  assert(
    normalizedFailedEvents[0].event_type === 'call.failed',
    'Test 5: Failed Call Status Mapping',
    `Mapped type: ${normalizedFailedEvents[0].event_type}`
  );

  // Test 6: EventBus Decoupled Subscriptions
  const eventBus = EventBus.getInstance();
  eventBus.clearSubscribers();

  let receivedCompletedEvent: NormalizedVoicePilotEvent | null = null;
  let wildcardEventCount = 0;

  eventBus.subscribe('call.completed', (evt) => {
    receivedCompletedEvent = evt;
  });

  eventBus.subscribe('*', () => {
    wildcardEventCount++;
  });

  await eventBus.publish(primaryCompleted!, vomyraEndPayload);

  assert(
    receivedCompletedEvent !== null &&
    (receivedCompletedEvent as any).event_id === primaryCompleted?.event_id &&
    wildcardEventCount === 1,
    'Test 6: EventBus Decoupled Subscriptions & Delivery',
    `Received event ID: ${(receivedCompletedEvent as any)?.event_id}`
  );

  console.log('\n----------------------------------------------------');
  console.log(`Event Engine Test Suite Finished: ${passedTests} passed, ${failedTests} failed.`);
  console.log('----------------------------------------------------\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runEventEngineTestSuite().catch((err) => {
  console.error('Unhandled Event Engine test error:', err);
  process.exit(1);
});
