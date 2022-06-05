import { handleRequest } from './handler';

const exportHandler: ExportedHandler = {
  fetch(request) {
    return handleRequest(request);
  }
};

export default exportHandler;
