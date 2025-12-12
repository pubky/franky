import { POST_THREAD_CONNECTOR_VARIANTS } from './PostThreadConnector.constants';

export type PostThreadConnectorVariant =
  (typeof POST_THREAD_CONNECTOR_VARIANTS)[keyof typeof POST_THREAD_CONNECTOR_VARIANTS];
