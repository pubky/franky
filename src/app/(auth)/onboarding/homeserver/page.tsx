'use client';

import {
  ArrowLeft,
  ArrowRight,
  Twitter,
  Mail,
  ExternalLink,
  Server,
  Zap,
  MessageCircle,
  Key,
  Users,
  CheckCircle,
  Hash,
  Network,
} from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';
import Link from 'next/link';
import { useState } from 'react';

export default function CreateAccount() {
  const [inviteCode, setInviteCode] = useState('');

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Remove all non-alphanumeric characters
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Limit to 12 characters (4+4+4)
    const limitedValue = cleanValue.slice(0, 12);

    // Add dashes at positions 4 and 8
    let formattedValue = '';
    for (let i = 0; i < limitedValue.length; i++) {
      if (i === 4 || i === 8) {
        formattedValue += '-';
      }
      formattedValue += limitedValue[i];
    }

    setInviteCode(formattedValue);
  };

  // Computed values
  const isCodeComplete = inviteCode.length === 14;
  const isButtonDisabled = !isCodeComplete;
  const buttonText = isCodeComplete ? 'Validate & Continue' : 'Enter Invite Code';
  const buttonTextMobile = isCodeComplete ? 'Continue' : 'Enter Code';

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={
          <>
            You are <span className="text-green-500">invited</span>.
          </>
        }
        subtitle="Join now and get your homeserver account."
        titleClassName="text-4xl sm:text-5xl lg:text-[60px] font-bold leading-none text-foreground"
        subtitleClassName="text-lg sm:text-xl lg:text-2xl leading-8"
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invite Code Section - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="px-6 py-4 sm:px-8 sm:py-5">
              {/* Header with Icon */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Server className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">Join Homeserver</h3>
                  <p className="text-muted-foreground">Enter your exclusive invite code</p>
                </div>
              </div>

              {/* Invite Code Input */}
              <div className="space-y-4 mb-8">
                <label className="text-sm font-medium text-muted-foreground">INVITE CODE</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={handleInviteCodeChange}
                    placeholder="XXXX-XXXX-XXXX"
                    className="w-full text-lg font-mono tracking-wider rounded-xl border-2 border-muted bg-background text-foreground p-4 transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30"
                    maxLength={14}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll validate your invite code when you proceed to create your account.
                </p>
              </div>

              {/* Contact Options for Users Without Invite */}
              <div className="border-t pt-6">
                <div className="bg-muted/30 rounded-xl p-6 border border-muted/50">
                  <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-green-500/10 rounded-xl">
                          <Mail className="w-5 h-5 text-green-500" />
                        </div>
                        <h4 className="text-xl font-bold text-foreground">Don&apos;t have an invite code?</h4>
                      </div>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        We&apos;re in private beta with limited access. Get your invite through one of these channels:
                      </p>
                    </div>

                    {/* Contact Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        className="flex items-center justify-between hover:bg-muted/50 hover:border-muted-foreground/30 transition-all duration-200 p-4 h-auto bg-background min-h-[70px]"
                        asChild
                      >
                        <a href="https://twitter.com/getpubky" target="_blank" rel="noopener noreferrer">
                          <div className="flex items-center gap-3">
                            <Twitter className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div className="text-left">
                              <div className="font-semibold text-foreground">Twitter</div>
                              <div className="text-xs text-muted-foreground">@getpubky</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-50 flex-shrink-0" />
                        </a>
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="flex items-center justify-between hover:bg-muted/50 hover:border-muted-foreground/30 transition-all duration-200 p-4 h-auto bg-background min-h-[70px]"
                        asChild
                      >
                        <a href="https://t.me/pubkychat" target="_blank" rel="noopener noreferrer">
                          <div className="flex items-center gap-3">
                            <MessageCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                            <div className="text-left">
                              <div className="font-semibold text-foreground">Telegram</div>
                              <div className="text-xs text-muted-foreground">@pubkychat</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-50 flex-shrink-0" />
                        </a>
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="flex items-center justify-between hover:bg-green-500/5 hover:border-green-500/30 transition-all duration-200 p-4 h-auto bg-background min-h-[70px] sm:col-span-2 lg:col-span-1"
                        asChild
                      >
                        <a href="mailto:hello@synonym.to?subject=Franky Beta Invite Request&body=Hi! I'd like to request an invite code for Franky beta. Thank you!">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div className="text-left">
                              <div className="font-semibold text-foreground">Email</div>
                              <div className="text-xs text-muted-foreground">hello@synonym.to</div>
                            </div>
                          </div>
                        </a>
                      </Button>
                    </div>

                    {/* Response Time Info */}
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span>
                        <span className="font-medium text-foreground">Fast response:</span> Typically within 24 hours
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Benefits Section - Takes 1 column */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="px-6 py-4 sm:px-8 sm:py-5 flex flex-col">
              <div className="flex flex-col gap-6 flex-grow">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-green-500/10 rounded-full px-3 py-1 mb-3">
                    <Network className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-green-600">Decentralized</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Why Choose Franky?</h3>
                  <p className="text-sm text-muted-foreground">The future of social networking</p>
                </div>

                <div className="space-y-5 flex-grow">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <div className="p-2 bg-green-500/10 rounded-lg mt-0.5">
                      <Key className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Your Keys, Your Identity</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Own your digital identity across the entire web
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <div className="p-2 bg-green-500/10 rounded-lg mt-0.5">
                      <Hash className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Smart Tagging System</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Organize and discover content with intelligent tags
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <div className="p-2 bg-green-500/10 rounded-lg mt-0.5">
                      <Users className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Web of Trust</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Build meaningful connections through trusted networks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
                    <div className="p-2 bg-green-500/10 rounded-lg mt-0.5">
                      <Network className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">Decentralized Network</h4>
                      <p className="text-xs text-muted-foreground mt-1">No single point of control or failure</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-auto">
                  <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-500/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="text-sm font-bold text-green-600">Beta Pioneer</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Join the privacy revolution early</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between mt-2">
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-full sm:w-auto"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          className="rounded-full w-full text-white sm:w-auto bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isButtonDisabled}
          asChild={isCodeComplete}
        >
          {isCodeComplete ? (
            <Link href="/onboarding/profile">
              <span className="hidden sm:inline">{buttonText}</span>
              <span className="sm:hidden">{buttonTextMobile}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <>
              <span className="hidden sm:inline">{buttonText}</span>
              <span className="sm:hidden">{buttonTextMobile}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
