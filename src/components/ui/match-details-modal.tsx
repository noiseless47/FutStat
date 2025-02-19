import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"

const getRatingColor = (rating: number) => {
  if (rating >= 8) return 'bg-blue-100 text-blue-700';
  if (rating >= 7) return 'bg-green-100 text-green-700';
  if (rating >= 6) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

export function MatchDetailsModal({ match, player, isOpen, onClose }: any) {
  const stats = match.statistics?.statistics;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center space-y-2">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <img 
                  src={`https://api.sofascore.com/api/v1/team/${match.homeTeam.id}/image`}
                  alt={match.homeTeam.name}
                  className="w-6 h-6"
                />
                <span className="text-lg font-medium">{match.homeTeam.name}</span>
              </div>
              <div className="text-xl font-bold">
                {match.homeScore.current} - {match.awayScore.current}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">{match.awayTeam.name}</span>
                <img 
                  src={`https://api.sofascore.com/api/v1/team/${match.awayTeam.id}/image`}
                  alt={match.awayTeam.name}
                  className="w-6 h-6"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(match.startTimestamp * 1000), 'PPP')}
            </div>
          </DialogTitle>
        </DialogHeader>

        {stats && (
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium text-muted-foreground">Attack</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Big Chances Created</span>
                    <span className="font-medium">{stats.bigChanceCreated || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Big Chances Missed</span>
                    <span className="font-medium">{stats.bigChanceMissed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Shots On Target</span>
                    <span className="font-medium">{stats.onTargetScoringAttempt || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Shots Off Target</span>
                    <span className="font-medium">{stats.shotOffTarget || 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-muted-foreground">Passing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Passes</span>
                    <span className="font-medium">{stats.totalPass || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Accurate Passes</span>
                    <span className="font-medium">{stats.accuratePass || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Key Passes</span>
                    <span className="font-medium">{stats.keyPass || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Crosses (Acc.)</span>
                    <span className="font-medium">{stats.accurateCross || 0}/{stats.totalCross || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Long Balls (Acc.)</span>
                    <span className="font-medium">{stats.accurateLongBalls || 0}/{stats.totalLongBalls || 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-muted-foreground">Possession</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Touches</span>
                    <span className="font-medium">{stats.touches || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duels Won</span>
                    <span className="font-medium">{stats.duelWon || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duels Lost</span>
                    <span className="font-medium">{stats.duelLost || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Possession Lost</span>
                    <span className="font-medium">{stats.possessionLostCtrl || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Dispossessed</span>
                    <span className="font-medium">{stats.dispossessed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Take-ons Won</span>
                    <span className="font-medium">{stats.wonContest || 0}/{stats.totalContest || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.minutesPlayed}'</div>
                  <div className="text-sm text-muted-foreground">Minutes Played</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.goals || 0}</div>
                  <div className="text-sm text-muted-foreground">Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.goalAssist || 0}</div>
                  <div className="text-sm text-muted-foreground">Assists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{((stats.accuratePass / stats.totalPass) * 100).toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Pass Accuracy</div>
                </div>
                <div className="text-center">
                  {stats.rating && (
                    <div className={`text-2xl font-bold inline-block px-2 py-1 rounded ${getRatingColor(stats.rating)}`}>
                      {stats.rating.toFixed(1)}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 