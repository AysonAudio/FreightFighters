/** All global variables to cache when the game is loaded. */
type GameUiCache = {
    /** A grid with building spot buttons. */
    gridElem: HTMLDivElement;
    /** A panel with building details and options. */
    buildPanelElem: HTMLDivElement;
};

/** A function that needs access to a global variable. */
type GameBuildingsFunc<Return> = (cache: GameUiCache, ...args) => Return;

/**
 * A decorator factory.
 * Manages one global {@link GameBuildingsCache} object and passes it to functions.
 */
const CACHE: <Return>(func: GameBuildingsFunc<Return>) => (...args) => Return =
    (() => {
        const cache: GameUiCache = {
            gridElem: document.body.querySelector("#game > .grid"),
            buildPanelElem: document.body.querySelector("#game > #build"),
        };

        return (func) => {
            return (...args) => func(cache, ...args);
        };
    })();

// ========================================================================== //

/**
 * Click grid button.
 * Show building details and options.
 */
const ShowPanel: () => void = CACHE((cache: GameUiCache) => {
    cache.buildPanelElem.style.display = "";
});

// ========================================================================== //

/**
 * Init grid buttons.
 */
export const InitGrid: () => void = CACHE((cache: GameUiCache) => {
    for (const buttonElem of cache.gridElem
        .children as HTMLCollectionOf<HTMLButtonElement>)
        buttonElem.onclick = () => ShowPanel();
});
