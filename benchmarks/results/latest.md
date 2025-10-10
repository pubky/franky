# Benchmark Summary

Generated: 2025-10-10T23:00:07.417Z

| Task | Avg (ms) | Margin | Samples | Ops/sec |
| --- | ---: | ---: | ---: | ---: |
| HomeserverService.request (GET) | 3.760 | - | 132985 | 265968.87 |
| HomeserverService.putBlob (3 bytes) | 4.195 | - | 119202 | 238403.92 |
| HomeserverService.generateAuthUrl | 2.745 | - | 182164 | 364326.39 |
| LocalPostService.fetch (limit=5) | 772.680 | - | 648 | 1294.20 |
| LocalPostService.create (root post) | 820.306 | - | 610 | 1219.06 |
| LocalTagService.create (unique label) | 2449.175 | - | 205 | 408.30 |
| LocalTagService.delete (single tagger) | 2922.266 | - | 172 | 342.20 |
