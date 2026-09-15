import app from '../src/index';

const handler = (req: Request) => app.fetch(req, (globalThis as any).process?.env || {});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;

export default handler;
