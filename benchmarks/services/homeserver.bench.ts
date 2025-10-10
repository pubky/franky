import { Bench } from 'tinybench';

import { HomeserverService } from '../../src/core/services/homeserver/homeserver.ts';
import { HomeserverAction } from '../../src/core/services/homeserver/homeserver.types.ts';

class StubAuthRequest {
  url() {
    return new URL('https://example.com/auth');
  }

  async response() {
    return { token: 'stub-session' };
  }
}

class StubClient {
  async getHomeserver() {
    return { host: 'stub.homeserver' };
  }

  async session() {
    return { token: 'stub-session' };
  }

  async signin() {
    return { ok: true };
  }

  async signup() {
    return { token: 'stub-session' };
  }

  async fetch() {
    return { ok: true } as Response;
  }

  async signout() {
    return { ok: true };
  }

  authRequest() {
    return new StubAuthRequest();
  }

  async republishHomeserver() {
    return { ok: true };
  }
}

const installStubClient = () => {
  const instance = HomeserverService.getInstance('');
  (instance as unknown as { client: StubClient }).client = new StubClient();
  return instance;
};

export const registerBenchmarks = async (bench: Bench) => {
  const service = installStubClient();

  bench.add('HomeserverService.request (GET)', async () => {
    await HomeserverService.request(HomeserverAction.GET, 'https://example.com/resource');
  });

  bench.add('HomeserverService.putBlob (3 bytes)', async () => {
    await HomeserverService.putBlob('https://example.com/blob', new Uint8Array([1, 2, 3]));
  });

  bench.add('HomeserverService.generateAuthUrl', async () => {
    await service.generateAuthUrl();
  });
};
