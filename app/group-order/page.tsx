'use client';

import { useState } from 'react';
import { Users, Copy, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface GroupMember {
  id: string;
  name: string;
  items: string[];
  subtotal: number;
}

export default function GroupOrderPage() {
  const [groupId] = useState('GROUP-2024-ABC123');
  const [members, setMembers] = useState<GroupMember[]>([
    { id: '1', name: 'You', items: ['Classic Burger', 'Fries'], subtotal: 19.98 },
    { id: '2', name: 'Alex', items: ['Spicy Samosas'], subtotal: 5.99 },
    { id: '3', name: 'Jordan', items: ['Buddha Bowl', 'Green Smoothie'], subtotal: 17.98 },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [copied, setCopied] = useState(false);

  const totalAmount = members.reduce((sum, m) => sum + m.subtotal, 0);
  const inviteLink = `https://desidelish.com/group-order/join/${groupId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = () => {
    if (newMemberName.trim()) {
      const newMember: GroupMember = {
        id: Date.now().toString(),
        name: newMemberName,
        items: [],
        subtotal: 0,
      };
      setMembers([...members, newMember]);
      setNewMemberName('');
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <section className="border-b border-border bg-card py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Group Order</h1>
          </div>
          <p className="text-muted-foreground">Order together with friends and split the bill</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Group Code & Share */}
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-6">Share Order Link</h2>

          <div className="space-y-4">
            {/* Group Code */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Group Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={groupId}
                  readOnly
                  className="flex-1 rounded-lg border border-border bg-muted px-4 py-2 text-foreground focus:outline-none"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Invite Link */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Invite Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 rounded-lg border border-border bg-muted px-4 py-2 text-foreground text-sm focus:outline-none truncate"
                />
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleCopyLink}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Share this link with friends to invite them to your group order
            </p>
          </div>
        </div>

        {/* Members List */}
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8 mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Members ({members.length})</h2>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
              {members.length} People
            </span>
          </div>

          <div className="space-y-4 mb-6">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-start justify-between rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {member.name}
                    {member.id === '1' && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        Organizer
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {member.items.length === 0 ? 'No items added' : `${member.items.length} items`}
                  </p>
                  {member.items.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {member.items.map((item, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">₹{member.subtotal.toFixed(2)}</p>
                  {member.id !== '1' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="mt-2 text-xs text-accent hover:text-accent/80"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add Member */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
              placeholder="Add a person..."
              className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <Button
              onClick={handleAddMember}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-8 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

          <div className="space-y-3 mb-6 pb-6 border-b border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-foreground">₹{(2.50).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="text-foreground">₹{((totalAmount + 2.50) * 0.08).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">₹{(totalAmount + 2.50 + (totalAmount + 2.50) * 0.08).toFixed(2)}</span>
          </div>

          <div className="bg-background rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground font-semibold mb-3">Split per person:</p>
            <p className="text-2xl font-bold text-primary">
              ₹{((totalAmount + 2.50 + (totalAmount + 2.50) * 0.08) / members.length).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">for {members.length} people</p>
          </div>

          <Link href="/cart" className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12">
              Proceed to Checkout
            </Button>
          </Link>
        </div>

        {/* Info Box */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-3">How Group Orders Work</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Share the invite link with friends</li>
            <li>• Each member can add items from any restaurant</li>
            <li>• View all members and their selections</li>
            <li>• The bill automatically splits evenly</li>
            <li>• Proceed to checkout when everyone's ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
