import { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { FT, T } from '#lib/types';
import { Guild } from 'discord.js';

export const AddDescription = T<string>('commands/music:addDescription');
export const AddExtended = T<LanguageHelpDisplayOptions>('commands/music:addExtended');
export const AddPlaylist = FT<{ songs: string }, string>('commands/music:addPlaylist');
export const AddPlaylistSongs = FT<{ count: number }, string>('commands/music:addPlaylistSongs');
export const AddSong = FT<{ title: string }, string>('commands/music:addSong');
export const ClearDescription = T<string>('commands/music:clearDescription');
export const ClearExtended = T<LanguageHelpDisplayOptions>('commands/music:clearExtended');
export const ClearDenied = T<string>('commands/music:clearDenied');
export const ClearSuccess = FT<{ count: number }, string>('commands/music:clearSuccess');
export const ExportQueueDescription = T<string>('commands/music:exportQueueDescription');
export const ExportQueueExtended = T<LanguageHelpDisplayOptions>('commands/music:exportQueueExtended');
export const ExportQueueSuccess = FT<{ guildName: string }, string>('commands/music:exportQueueSuccess');
export const ImportQueueDescription = T<string>('commands/music:importQueueDescription');
export const ImportQueueExtended = T<LanguageHelpDisplayOptions>('commands/music:importQueueExtended');
export const JoinDescription = T<string>('commands/music:joinDescription');
export const JoinExtended = T<LanguageHelpDisplayOptions>('commands/music:joinExtended');
export const JoinNoMember = T<string>('commands/music:joinNoMember');
export const JoinNoVoiceChannel = T<string>('commands/music:joinNoVoicechannel');
export const JoinSuccess = FT<{ channel: string }, string>('commands/music:joinSuccess');
export const JoinVoiceDifferent = T<string>('commands/music:joinVoiceDifferent');
export const JoinVoiceFull = T<string>('commands/music:joinVoiceFull');
export const JoinVoiceNoConnect = T<string>('commands/music:joinVoiceNoConnect');
export const JoinVoiceNoSpeak = T<string>('commands/music:joinVoiceNoSpeak');
export const JoinVoiceSame = T<string>('commands/music:joinVoiceSame');
export const JoinFailed = T<string>('commands/music:joinFailed');
export const LeaveDescription = T<string>('commands/music:leaveDescription');
export const LeaveExtended = T<LanguageHelpDisplayOptions>('commands/music:leaveExtended');
export const LeaveSuccess = FT<{ channel: string }, string>('commands/music:leaveSuccess');
export const PauseDescription = T<string>('commands/music:pauseDescription');
export const PauseExtended = T<LanguageHelpDisplayOptions>('commands/music:pauseExtended');
export const PauseSuccess = T<string>('commands/music:pauseSuccess');
export const PlayDescription = T<string>('commands/music:playDescription');
export const PlayExtended = T<LanguageHelpDisplayOptions>('commands/music:playExtended');
export const PlayEnd = T<string>('commands/music:playEnd');
export const PlayNext = FT<{ title: string; requester: string }, string>('commands/music:playNext');
export const PlayQueuePaused = FT<{ song: string }, string>('commands/music:playQueuePaused');
export const PlayQueuePlaying = T<string>('commands/music:playQueuePlaying');
export const PlayQueueEmpty = T<string>('commands/music:playQueueEmpty');
export const PlayingDescription = T<string>('commands/music:playingDescription');
export const PlayingExtended = T<LanguageHelpDisplayOptions>('commands/music:playingExtended');
export const PlayingDuration = FT<{ duration: string }, string>('commands/music:playingDuration');
export const PlayingQueueEmpty = T<string>('commands/music:playingQueueEmpty');
export const PlayingQueueNotPlaying = T<string>('commands/music:playingQueueNotPlaying');
export const RepeatDescription = T<string>('commands/music:repeatDescription');
export const RepeatExtended = T<LanguageHelpDisplayOptions>('commands/music:repeatExtended');
export const RepeatSuccessEnabled = T<string>('commands/music:repeatSuccessEnabled');
export const RepeatSuccessDisabled = T<string>('commands/music:repeatSuccessDisabled');
export const QueueDescription = T<string>('commands/music:queueDescription');
export const QueueExtended = T<LanguageHelpDisplayOptions>('commands/music:queueExtended');
export const QueueLast = T<string>('commands/music:queueLast');
export const QueueTitle = FT<{ guildname: string }, string>('commands/music:queueTitle');
export const QueueLine = FT<{ position: number; duration: string; title: string; url: string; requester: string }, string>(
	'commands/music:queueLine'
);
export const QueueNowPlaying = FT<{ title: string; url: string; requester: string }, string>('commands/music:queueNowplaying');
export const QueueNowPlayingTimeRemaining = FT<{ timeRemaining: string }, string>('commands/music:queueNowplayingTimeRemaining');
export const QueueNowPlayingLiveStream = T<string>('commands/music:queueNowplayingLiveStream');
export const QueueNowPlayingTitle = T<string>('commands/music:queueNowplayingTitle');
export const QueueTotalTitle = T<string>('commands/music:queueTotalTitle');
export const QueueTotal = FT<{ songs: string; remainingTime: string }, string>('commands/music:queueTotal');
export const QueueEmpty = T<string>('commands/music:queueEmpty');
export const QueueDashboardInfo = FT<{ guild: Guild }, string>('commands/music:queueDashboardInfo');
export const RemoveDescription = T<string>('commands/music:removeDescription');
export const RemoveExtended = T<LanguageHelpDisplayOptions>('commands/music:removeExtended');
export const RemoveIndexInvalid = T<string>('commands/music:removeIndexInvalid');
export const RemoveIndexOutOfBounds = FT<{ songs: string }, string>('commands/music:removeIndexOutOfBounds');
export const RemoveDenied = T<string>('commands/music:removeDenied');
export const RemoveSuccess = FT<{ title: string; requester: string }, string>('commands/music:removeSuccess');
export const SeekDescription = T<string>('commands/music:seekDescription');
export const SeekExtended = T<LanguageHelpDisplayOptions>('commands/music:seekExtended');
export const SeekSuccess = FT<{ time: number }, string>('commands/music:seekSuccess');
export const ResumeDescription = T<string>('commands/music:resumeDescription');
export const ResumeExtended = T<LanguageHelpDisplayOptions>('commands/music:resumeExtended');
export const ResumeSuccess = T<string>('commands/music:resumeSuccess');
export const ShuffleDescription = T<string>('commands/music:shuffleDescription');
export const ShuffleExtended = T<LanguageHelpDisplayOptions>('commands/music:shuffleExtended');
export const ShuffleSuccess = FT<{ amount: number }, string>('commands/music:shuffleSuccess');
export const SkipDescription = T<string>('commands/music:skipDescription');
export const SkipExtended = T<LanguageHelpDisplayOptions>('commands/music:skipExtended');
export const SkipPermissions = T<string>('commands/music:skipPermissions');
export const SkipVotesVoted = T<string>('commands/music:skipVotesVoted');
export const SkipVotesTotal = FT<{ amount: number; needed: number }, string>('commands/music:skipVotesTotal');
export const SkipSuccess = FT<{ title: string }, string>('commands/music:skipSuccess');
export const PlayingTimeDescription = T<string>('commands/music:playingTimeDescription');
export const PlayingTimeQueueEmpty = T<string>('commands/music:playingTimeQueueEmpty');
export const PromoteDescription = T<string>('commands/music:promoteDescription');
export const PromoteExtended = T<LanguageHelpDisplayOptions>('commands/music:promoteExtended');
export const PromoteSuccess = FT<{ title: string; url: string }, string>('commands/music:promoteSuccess');
export const VolumeDescription = T<string>('commands/music:volumeDescription');
export const VolumeExtended = T<LanguageHelpDisplayOptions>('commands/music:volumeExtended');
export const VolumeSuccess = FT<{ volume: number }, string>('commands/music:volumeSuccess');
export const VolumeChanged = FT<{ emoji: string; volume: number }, string>('commands/music:volumeChanged');
export const VolumeChangedExtreme = FT<{ emoji: string; text: string; volume: number }, string>('commands/music:volumeChangedExtreme');
export const VolumeChangedTexts = T<readonly string[]>('commands/music:volumeChangedTexts');
