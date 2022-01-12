<script>
  import { afterUpdate, onMount } from "svelte";
  import { writable } from "svelte/store";
  import perlin from "./perlinNoise";
  import englishWords from "./data/english-words.json";
  import FormLabel from "./FormLabel.svelte";
  import FormGroup from "./FormGroup.svelte";
  import debounce from "lodash/debounce";
  import { color, randomChoice, xmur3 } from "./util";
  import { INPUT_NOISE_REGEN_DELAY } from "./constants";

  const saved = writable("saved");
  saved.subscribe((value) => {
    localStorage.setItem("saved", JSON.stringify(value));
  });

  // Controls
  const minFreq = 0;
  const maxFreq = 32;
  let frequency = 4.0;
  const onFrequencyChange = debounce((e) => {
    console.log("called");
    frequency = parseFloat(e.target.value);
  }, INPUT_NOISE_REGEN_DELAY);

  const minLacunarity = 0;
  const maxLacunarity = 32;
  let lacunarity = 2.5;
  const onLacunarityChange = (e) => {
    lacunarity = parseFloat(e.target.value);
  };

  const minGain = 0;
  const maxGain = 1;
  let gain = 0.6;
  const onGainChange = (e) => {
    gain = parseFloat(e.target.value);
  };

  let octaves = 8;
  const minOctaves = 1;
  const maxOctaves = 64;
  const onOctavesChange = (e) => {
    octaves = parseInt(e.target.value);
  };

  const onSave = () => {
    saved.set({
      seed,
      frequency,
      lacunarity,
      gain,
      octaves,
    });
  };

  let canvas = null;

  const BiomeKind = {
    Ocean: 0,
    Mountains: 1,
    Desert: 2,
  };

  function biome(rainfall, temp, height) {
    if (height < 0.25) {
      return BiomeKind.Ocean;
    } else {
      if (height > 0.75) {
        return BiomeKind.Mountains;
      }
      return BiomeKind.Desert;
    }
  }

  const composedNoise = (xx, yy) => {
    let sum = 0;
    let freq = frequency;
    let amplitude = 1.0;
    for (let i = 0; i < octaves; ++i) {
      let n = (noise.perlin2(freq * xx, freq * yy) + 1.0) / 2.0;
      sum += n * amplitude;
      freq *= lacunarity;
      amplitude *= gain;
    }
    return sum;
  };

  function funBiomes(xx, yy) {
    const sum = composedNoise();

    let rainfall = (noise.perlin2(xx, yy) + 1.0) / 2.0;
    let temp = (noise.perlin2(xx, yy) + 1.0) / 2.0;
    let height = sum;

    const b = biome(rainfall, temp, height);
    if (b === BiomeKind.Ocean) {
      return color(0, 0, 255);
    }
    if (b === BiomeKind.Mountains) {
      return color(183, 176, 157);
    }
    if (b === BiomeKind.Desert) {
      return color(237, 201, 175);
    }
    return color(255, 0, 255);
  }

  const funTexture = (x, y) => {
    const sum = composedNoise(x, y);
    const k = sum * 255;
    return color(k, k, k);
  };

  const fun = funTexture;

  let ctx = null;

  let W = 64;
  let H = 64;
  let maxHeight = 128;

  let genTook = 0;

  // Generate seed number from a string using MurMurHash3

  const seedKeysDict = englishWords["commonWords"];

  const randomSeedKey = () => {
    return randomChoice(seedKeysDict);
  };

  let seedPhrase = randomSeedKey();
  const onSeedChange = (e) => {
    seedPhrase = e.target.value;
  };

  const regenerate = () => {
    seedPhrase = randomSeedKey();
  };

  const update = () => {
    const timestamp = Date.now();
    const seedGenerator = xmur3(seedPhrase);
    const seed = seedGenerator();
    noise.seed(seed);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let p = 0; p < imageData.data.length; p += 4) {
      const i = p / 4;
      const x = i % canvas.width;
      const z = (i / canvas.width) >>> 0;
      const xx = x / canvas.width;
      const zz = z / canvas.height;
      const rgb = fun(xx, zz);
      let red = (rgb >> 16) & 0xff;
      let green = (rgb >> 8) & 0xff;
      let blue = rgb & 0xff;
      imageData.data[p + 0] = red;
      imageData.data[p + 1] = green;
      imageData.data[p + 2] = blue;
      imageData.data[p + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    const end = Date.now();
    const took = end - timestamp;
    genTook = took;
  };

  afterUpdate(() => {
    update();
  });

  function initApp() {}

  function initGL() {
    // Initialize the GL context
    ctx = canvas.getContext("2d");

    // Only continue if WebGL is available and working
    if (ctx === null) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
      return;
    }

    return () => {};
  }

  let canvasContainer = null;

  function windowResize() {
    if (canvasContainer === null) return;
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
  }

  onMount(() => {
    initGL();
    windowResize();
    window.addEventListener("resize", windowResize);
  });
</script>

<div class="h-full p-4 w-full flex-1 flex flex-col text-black">
  <FormGroup>
    <FormLabel name="seed">Seed</FormLabel>
    <input
      bind:value={seedPhrase}
      on:change={onSeedChange}
      type="text"
      class="
        form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
      "
      id="seed"
      placeholder="Seed phrase"
    />
  </FormGroup>

  <FormGroup>
    <FormLabel name="freq">Frequency ({frequency})</FormLabel>
    <input
      bind:value={frequency}
      type="range"
      id="freq"
      name="freq"
      step="any"
      min={minFreq}
      max={maxFreq}
      class="
      form-range
      appearance-none
      w-full
      h-6
      p-0
      bg-transparent
      focus:outline-none focus:ring-0 focus:shadow-none
"
      on:change={onFrequencyChange}
    />
  </FormGroup>

  <FormGroup>
    <FormLabel name="lacunarity">Lacunarity ({lacunarity})</FormLabel>
    <input
      bind:value={lacunarity}
      type="range"
      id="lacunarity"
      name="lacunarity"
      step="any"
      min={minLacunarity}
      max={maxLacunarity}
      class="
      form-range
      appearance-none
      w-full
      h-6
      p-0
      bg-transparent
      focus:outline-none focus:ring-0 focus:shadow-none
"
      on:change={onLacunarityChange}
    />
  </FormGroup>

  <FormGroup>
    <FormLabel name="gain">Gain ({gain})</FormLabel>
    <input
      bind:value={gain}
      type="range"
      id="gain"
      name="gain"
      step="any"
      min={minGain}
      max={maxGain}
      class="
      form-range
      appearance-none
      w-full
      h-6
      p-0
      bg-transparent
      focus:outline-none focus:ring-0 focus:shadow-none
"
      on:change={onGainChange}
    />
  </FormGroup>

  <FormGroup>
    <FormLabel name="octaves">Octaves ({octaves})</FormLabel>
    <input
      bind:value={octaves}
      type="range"
      id="octaves"
      name="octaves"
      min={minOctaves}
      max={maxOctaves}
      class="
      form-range
      appearance-none
      w-full
      h-6
      p-0
      bg-transparent
      focus:outline-none focus:ring-0 focus:shadow-none
"
      on:change={onOctavesChange}
    />
  </FormGroup>
</div>

<div class="bg-white h-full p-4 w-full flex-1 flex flex-col">
  <div class="my-2 flex flex-0 flex-row space-x-2 items-center">
    <div>Generation took: <b>{genTook}ms</b></div>
    <div class="flex-1" />
    <button
      on:click={regenerate}
      type="button"
      class="
    inline-block px-6 py-2.5 bg-lime-600 text-white font-medium text-xs
    leading-tight uppercase rounded shadow-md hover:bg-lime-700 hover:shadow-lg
    focus:bg-lime-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-lime-800
    active:shadow-lg transition duration-150 ease-in-out">Regenerate</button
    >
    <button
      on:click={onSave}
      type="button"
      class="inline-block px-6 py-2.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
      >Save</button
    >
  </div>
  <div bind:this={canvasContainer} class="flex-1">
    <canvas bind:this={canvas} width="640" height="480" />
  </div>
</div>

<style>
</style>
