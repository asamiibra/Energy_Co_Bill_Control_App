import registryRows from '@/data/interaction-registry.json';

export type InteractionMode =
  'customer' | 'presentation' | 'demo' | 'all' | 'error';

export type InteractionContract = {
  interactionId: string;
  route: string;
  mode: InteractionMode;
  label: string;
  controlType: string;
  expectedOutcome: string;
  stateMutation: string;
  service: string;
  eventName: string;
  testId: string;
};

type RegistryRow = [
  interactionId: string,
  route: string,
  label: string,
  expectedOutcome: string,
  stateMutation: string,
  service: string,
  eventName: string,
  testId: string,
];

function modeForRoute(route: string): InteractionMode {
  if (route === 'presentation') return 'presentation';
  if (route === 'demo') return 'demo';
  if (route === 'error' || route === 'unknown') return 'error';
  if (route === 'all') return 'all';
  return 'customer';
}

function controlTypeForMutation(stateMutation: string): string {
  if (stateMutation.includes('route')) return 'navigation control';
  if (stateMutation === 'form value') return 'form control';
  if (stateMutation === 'selection') return 'selection control';
  if (
    stateMutation === 'dialog' ||
    stateMutation === 'panel' ||
    stateMutation === 'menu' ||
    stateMutation === 'disclosure'
  ) {
    return 'disclosure control';
  }
  return 'action control';
}

export const interactionRegistry: InteractionContract[] = (
  registryRows as RegistryRow[]
).map(
  ([
    interactionId,
    route,
    label,
    expectedOutcome,
    stateMutation,
    service,
    eventName,
    testId,
  ]) => ({
    interactionId,
    route,
    mode: modeForRoute(route),
    label,
    controlType: controlTypeForMutation(stateMutation),
    expectedOutcome,
    stateMutation,
    service,
    eventName,
    testId,
  })
);
