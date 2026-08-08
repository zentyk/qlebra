import bgm1 from './bgm1.mp3';
import bgm2 from './bgm2.mp3';
import bgm3 from './bgm3.mp3';

const playlist = [bgm1, bgm2, bgm3];

export class AudioManager {
    private currentAudio: HTMLAudioElement | null = null;
    private nextAudio: HTMLAudioElement | null = null;
    private isPlaying = false;
    private fadeDuration = 3000; // 3 seconds crossfade
    private crossfading = false;
    private isMuted = false;

    private unlocked = false;

    constructor() {
        const unlock = () => {
            if (this.unlocked) return;
            
            // Play a silent base64 audio to unlock the browser's audio engine on first interaction
            const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
            silentAudio.play().then(() => {
                silentAudio.pause();
                this.unlocked = true;
                window.removeEventListener('click', unlock);
                window.removeEventListener('touchstart', unlock);
            }).catch(() => {});
        };
        
        window.addEventListener('click', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
    }

    public play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.playNextTrack(false);
    }

    public toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.currentAudio) this.currentAudio.muted = this.isMuted;
        if (this.nextAudio) this.nextAudio.muted = this.isMuted;
    }

    private playNextTrack(doCrossfade: boolean) {
        const randomTrack = playlist[Math.floor(Math.random() * playlist.length)];
        this.nextAudio = new Audio(randomTrack);
        this.nextAudio.volume = 0;
        this.nextAudio.muted = this.isMuted;
        
        this.nextAudio.addEventListener('timeupdate', () => this.handleTimeUpdate());
        this.nextAudio.play().catch(e => {
            console.warn("Audio autoplay blocked by browser. Waiting for interaction...", e);
            // Bulletproof fallback: Wait for any click/touch and force play
            const retryPlay = () => {
                if (this.nextAudio) {
                    this.nextAudio.play().catch(() => {});
                } else if (this.currentAudio) {
                    this.currentAudio.play().catch(() => {});
                }
                window.removeEventListener('click', retryPlay);
                window.removeEventListener('touchstart', retryPlay);
                window.removeEventListener('keydown', retryPlay);
            };
            window.addEventListener('click', retryPlay, { once: true });
            window.addEventListener('touchstart', retryPlay, { once: true });
            window.addEventListener('keydown', retryPlay, { once: true });
        });

        if (doCrossfade && this.currentAudio) {
            this.crossfading = true;
            this.fadeAudio(this.currentAudio, this.currentAudio.volume, 0, () => {
                if (this.currentAudio) {
                    this.currentAudio.pause();
                    this.currentAudio.src = '';
                }
                this.currentAudio = this.nextAudio;
                this.nextAudio = null;
                this.crossfading = false;
            });
            this.fadeAudio(this.nextAudio, 0, 1);
        } else {
            this.nextAudio.volume = 1;
            this.currentAudio = this.nextAudio;
            this.nextAudio = null;
        }
    }

    private handleTimeUpdate() {
        if (!this.currentAudio || this.crossfading) return;

        const timeLeft = this.currentAudio.duration - this.currentAudio.currentTime;
        // Start crossfade when there is 3 seconds left
        if (timeLeft <= this.fadeDuration / 1000 && timeLeft > 0) {
            this.playNextTrack(true);
        }
    }

    private fadeAudio(audio: HTMLAudioElement, startVol: number, endVol: number, callback?: () => void) {
        const steps = 30;
        const stepTime = this.fadeDuration / steps;
        const volStep = (endVol - startVol) / steps;
        
        let currentStep = 0;
        audio.volume = startVol;

        const interval = setInterval(() => {
            currentStep++;
            let newVol = startVol + (volStep * currentStep);
            
            // Clamp volume to avoid DOM exceptions
            if (newVol > 1) newVol = 1;
            if (newVol < 0) newVol = 0;
            
            audio.volume = newVol;

            if (currentStep >= steps) {
                clearInterval(interval);
                audio.volume = endVol;
                if (callback) callback();
            }
        }, stepTime);
    }
}

export const audioManager = new AudioManager();
