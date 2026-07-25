import handler from 'vinext/server/app-router-entry';

const worker = {
  async fetch(
    request: Request,
    environment: Record<string, unknown>,
    context: {
      waitUntil(promise: Promise<unknown>): void;
      passThroughOnException(): void;
    }
  ): Promise<Response> {
    return handler.fetch(request, environment, context);
  },
};

export default worker;
