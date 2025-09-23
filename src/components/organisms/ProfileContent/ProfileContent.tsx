import * as Templates from '@/templates';
import * as Atoms from '@/atoms';
import * as Libs from '@/libs';

export function ProfileContent({ pubkyParam }: Templates.TProfilePageProps) {
  console.log('pubkyParam', pubkyParam);
  return (
    <main className="flex-1 min-w-0">
      <Atoms.Container className="bg-background rounded-lg p-6">
        <div className="space-y-4">
          {/* User Profile Cards - Similar to the image */}
          <div className="space-y-4">
            {/* Profile Item 1 */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Atoms.Avatar className="w-12 h-12">
                  <Atoms.AvatarFallback>MJ</Atoms.AvatarFallback>
                </Atoms.Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Matt Jones</span>
                  <span className="text-xs text-muted-foreground">1RX3...KO43</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Atoms.Badge variant="outline" className="text-xs">
                    candid
                  </Atoms.Badge>
                  <Atoms.Badge variant="outline" className="text-xs">
                    bitcoin
                  </Atoms.Badge>
                  <Atoms.Badge variant="outline" className="text-xs">
                    synonym
                  </Atoms.Badge>
                </div>
                <div className="flex flex-col items-center text-xs text-muted-foreground">
                  <span>TAGS</span>
                  <span>761</span>
                </div>
                <div className="flex flex-col items-center text-xs text-muted-foreground">
                  <span>POSTS</span>
                  <span>158</span>
                </div>
                <Atoms.Button variant="ghost" size="sm">
                  <Libs.Check className="w-4 h-4" />
                </Atoms.Button>
              </div>
            </div>

            {/* Profile Item 2 */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Atoms.Avatar className="w-12 h-12">
                  <Atoms.AvatarFallback>CS</Atoms.AvatarFallback>
                </Atoms.Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Carl Smith</span>
                  <span className="text-xs text-muted-foreground">1YX3...9BLY</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Atoms.Badge variant="outline" className="text-xs">
                    frontender
                  </Atoms.Badge>
                  <Atoms.Badge variant="outline" className="text-xs">
                    funny
                  </Atoms.Badge>
                  <Atoms.Badge variant="outline" className="text-xs">
                    html
                  </Atoms.Badge>
                </div>
                <div className="flex flex-col items-center text-xs text-muted-foreground">
                  <span>TAGS</span>
                  <span>761</span>
                </div>
                <div className="flex flex-col items-center text-xs text-muted-foreground">
                  <span>POSTS</span>
                  <span>158</span>
                </div>
                <Atoms.Button variant="ghost" size="sm">
                  <Libs.UserPlus className="w-4 h-4" />
                </Atoms.Button>
              </div>
            </div>

            {/* Profile Item 3 */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Atoms.Avatar className="w-12 h-12">
                  <Atoms.AvatarFallback>CS</Atoms.AvatarFallback>
                </Atoms.Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Carl Smith</span>
                  <span className="text-xs text-muted-foreground">1YXP...7R32</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Atoms.Badge variant="outline" className="text-xs">
                    candid
                  </Atoms.Badge>
                  <Atoms.Badge variant="outline" className="text-xs">
                    bitcoin
                  </Atoms.Badge>
                  <Atoms.Badge variant="outline" className="text-xs">
                    synonym
                  </Atoms.Badge>
                </div>
                <div className="flex flex-col items-center text-xs text-muted-foreground">
                  <span>TAGS</span>
                  <span>761</span>
                </div>
                <div className="flex flex-col items-center text-xs text-muted-foreground">
                  <span>POSTS</span>
                  <span>158</span>
                </div>
                <Atoms.Button variant="ghost" size="sm">
                  <Libs.Check className="w-4 h-4" />
                </Atoms.Button>
              </div>
            </div>

            {/* Profile Item 4 */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Atoms.Avatar className="w-12 h-12">
                  <Atoms.AvatarFallback>AP</Atoms.AvatarFallback>
                </Atoms.Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Anna Pleb</span>
                  <span className="text-xs text-muted-foreground">1YX1...PL32</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <Atoms.Badge variant="outline" className="text-xs">
                    pleb
                  </Atoms.Badge>
                  <Atoms.Badge variant="outline" className="text-xs">
                    bitcoin
                  </Atoms.Badge>
                  <Atoms.Badge variant="outline" className="text-xs">
                    hot
                  </Atoms.Badge>
                </div>
                <div className="flex flex-col items-center text-xs text-muted-foreground">
                  <span>TAGS</span>
                  <span>761</span>
                </div>
                <div className="flex flex-col items-center text-xs text-muted-foreground">
                  <span>POSTS</span>
                  <span>158</span>
                </div>
                <Atoms.Button variant="ghost" size="sm">
                  <Libs.Check className="w-4 h-4" />
                </Atoms.Button>
              </div>
            </div>
          </div>
        </div>
      </Atoms.Container>
    </main>
  );
}
