export interface TChatwootContact {
  id: number;
  email: string;
  name: string;
  contact_inboxes: Array<{
    source_id: string;
  }>;
}

export interface TChatwootContactSearchResponse {
  payload: TChatwootContact[];
}

export interface TChatwootCreateContactResponse {
  payload: {
    contact: TChatwootContact;
  };
}
