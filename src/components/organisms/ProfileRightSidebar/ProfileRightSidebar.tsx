import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function ProfileRightSidebar() {
  return (
    <aside className="w-56 flex-shrink-0">
      <div className="space-y-4">
        {/* Tagged As Section */}
        <Atoms.Container className="bg-background rounded-lg p-4">
          <Atoms.Heading level={3} size="sm" className="mb-4 font-semibold">
            Tagged as
          </Atoms.Heading>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Atoms.Badge className="bg-red-900 text-red-100 hover:bg-red-800">satoshi</Atoms.Badge>
                <span className="text-sm text-muted-foreground">36</span>
              </div>
              <Atoms.Button variant="ghost" size="sm">
                <Libs.Search className="w-4 h-4" />
              </Atoms.Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Atoms.Badge className="bg-yellow-700 text-yellow-100 hover:bg-yellow-600">bitcoin</Atoms.Badge>
                <span className="text-sm text-muted-foreground">21</span>
              </div>
              <Atoms.Button variant="ghost" size="sm">
                <Libs.Search className="w-4 h-4" />
              </Atoms.Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Atoms.Badge className="bg-blue-700 text-blue-100 hover:bg-blue-600">og</Atoms.Badge>
                <span className="text-sm text-muted-foreground">5</span>
              </div>
              <Atoms.Button variant="ghost" size="sm">
                <Libs.Search className="w-4 h-4" />
              </Atoms.Button>
            </div>
          </div>

          <Atoms.Button variant="outline" className="w-full mt-4 gap-2">
            <Libs.Plus className="w-4 h-4" />
            Add Tag
          </Atoms.Button>
        </Atoms.Container>

        {/* Links Section */}
        <Atoms.Container className="bg-background rounded-lg p-4">
          <Atoms.Heading level={3} size="sm" className="mb-4 font-semibold">
            Links
          </Atoms.Heading>
          <div className="text-sm text-muted-foreground">
            <p>No links added yet.</p>
          </div>
        </Atoms.Container>
      </div>
    </aside>
  );
}
