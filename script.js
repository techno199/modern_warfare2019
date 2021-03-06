(function () {
    const STATE_CHANGED_EVENT = 'STATE_CHANGED_EVENT';

    const bg_audio = new Audio('./media/cod_soundtrack_1.mp3');
    bg_audio.currentTime = 25.98;

    const button_hover_audio = [
        new Audio('./media/hover_1.mp3')
    ];
    const button_click_audio = [
        new Audio('./media/click_1.mp3'),
        new Audio('./media/click_2.mp3'),
        new Audio('./media/click_3.mp3'),
        new Audio('./media/click_4.mp3'),
        new Audio('./media/click_5.mp3')
    ];

    let filter_button_click_audio = new Audio('./media/click_filter.mp3');
    filter_button_click_audio.volume = 0.3;
    filter_button_click_audio = [ filter_button_click_audio ];

    const config = {
        background_volume: 0.1,
        audio_presets: [
            {
                name: '.default-button-audio',
                hover: button_hover_audio,
                click: button_click_audio
            },
            {
                name: '.default-button-hover-audio',
                hover: button_hover_audio
            },
            {
                name: '.default-button-click-audio',
                click: button_click_audio
            },
            {
                name: '.filter-button-click-audio',
                click: filter_button_click_audio
            }
        ]
    }

    let state = {
        fps: 0,
        sound_muted: false
    }

    const stateChangedEvent = new Event(STATE_CHANGED_EVENT);
    function setState(stateSlice) {
        state = { ...state, ...stateSlice };
        window.dispatchEvent(stateChangedEvent);
    }

    window.addEventListener('load', function () {
        const modal = document.querySelector('.launcher');
        const launcher_play = document.querySelector('.launcher__play');

        launcher_play.addEventListener('click', function () {
            modal.classList.add('hidden');

            initBackgroundAudio();
            initButtonsAudio();
            initFpsCounter();
            subscribeStatsValueChange();
        })
    })

    window.addEventListener(STATE_CHANGED_EVENT, function (e) {
        if (state.sound_muted) {
            bg_audio.volume = 0;
        } else {
            bg_audio.volume = config.background_volume;
        }
    })

    window.addEventListener('keydown', function () {
        setState({ sound_muted: !state.sound_muted });
    })

    function initBackgroundAudio() {
        function handleClick() {
            window.removeEventListener('click', handleClick);
            bg_audio.volume = 0;
            bg_audio.play();

            const interval_time = 50;
            const audio_transition_time = 4000;
            const interval_ticks = audio_transition_time / interval_time;
            const audio_transition_value_per_tick = config.background_volume / interval_ticks;

            const interval_id = setInterval(function () {
                bg_audio.volume = Math.min(config.background_volume, bg_audio.volume + audio_transition_value_per_tick);

                const is_transition_ended = bg_audio.volume === config.background_volume;

                if (is_transition_ended) {
                    clearInterval(interval_id);
                }
            }, interval_time);
        }

        window.addEventListener('click', handleClick);
    }

    function initButtonsAudio() {
        for (let audio_preset of config.audio_presets) {
            let buttons = document.querySelectorAll(audio_preset.name);

            buttons.forEach(function (button) {
                if (audio_preset.hover) {
                    button.addEventListener('mouseenter', function () {
                        playRandomAudio(audio_preset.hover);
                    });
                }
                
                if (audio_preset.click) {
                    button.addEventListener('click', function () {
                        playRandomAudio(audio_preset.click);
                    });
                }
                
            })
        }

    }

    function initFpsCounter() {
        setInterval(function () {
            const randomized_fps = Math.floor(Math.random() * 60 + 150);

            setState({ fps: randomized_fps });
        }, 250);
    }

    function subscribeStatsValueChange() {
        const fps_counter_elem = document.querySelector('.game-stats__fps .game-stats__value');
        const mute_sound_elem = document.querySelector('.game-stats__mute-sound .game-stats__value');

        window.addEventListener(STATE_CHANGED_EVENT, function () {
            fps_counter_elem.innerHTML = state.fps;
            mute_sound_elem.innerHTML = state.sound_muted ? 'Enabled' : 'Disabled';
        })
    }
})();

function playRandomAudio(audio_array) {
    const random_audio = audio_array[
        Math.floor(Math.random() * audio_array.length)
    ];

    random_audio.currentTime = 0;
    random_audio.play();
}

