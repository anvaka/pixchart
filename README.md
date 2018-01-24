[![pixchart](https://i.imgur.com/LOcOPQd.gif)](https://anvaka.github.io/share/part/?d=3.14&link=https%3A%2F%2Fi.imgur.com%2F9kieHIz.jpg&theme=zodiac&ignore=)

This is just a fun little project, that turns any picture into a histogram. A few examples:

* [Gaussian Distribution](https://anvaka.github.io/share/part/?d=3.14&link=https%3A%2F%2Fi.imgur.com%2Fiyf2bRA.png&theme=zodiac&ignore=)
* [The Falcon](https://anvaka.github.io/share/part/?link=https%3A%2F%2Fi.imgur.com%2Fhyt5lCu.jpg&d=5&ignore=&bc=300)
* [The Falcon in 15 buckets](https://anvaka.github.io/share/part/?link=https%3A%2F%2Fi.imgur.com%2Fhyt5lCu.jpg&d=5&ignore=&bc=15&theme=bunting)
* [Where is the dog?](https://anvaka.github.io/pixchart/?d=4&ignore=&link=https%3A%2F%2Fi.imgur.com%2FC4LHgpC.jpg&initial=collapsed&bc=10)

For each pixel in the image, it maps a component of a color space to X axis and
then counts how many pixels share the X coordinate. This number becomes Y coordinate
of a pixel.

# How to use it?

You can drop your images directly onto the website, and it will work in
"screensaver" mode, automatically playing images. You can also paste images directly from the clipboard.

## Random images

Random images that appear when you click "Try random image" button are collected from
reddit. I used [BigQuery](https://bigquery.cloud.google.com/dataset/fh-bigquery:reddit_posts) to
find top images of 2017, that point to `i.imgur.com` domain. 

## Internals

I'm using WebGL to perform animation. Each image is not rendered like a normal texture, but rather
as a giant array of points. Each point happen to have the same color as a pixel in the original image.

To perform an animation, we need to know where each pixel needs to go. I.e. its final `(x, y)` coordinates.
Calculation of the target position happens on the CPU, while animation is entirely offloaded to GPU.

The CPU computes array of pixel's attributes, which is uploaded onto GPU. 
In this array, each pixel gets four elements:

```
[x_coordinate, y_coordinate, animation_life_span, index_of_a_pixel]
```

* `x_coordinate` - is in [0, 1] range, and corresponds to final X position;
* `y_coordinate` - is in [0, max_count] range. To scale it properly, I also note what was the highest
seen count value, and pass it as a uniform value into shader.
* `animation_life_span` - †his is a random value sampled from a normal distribution. It defines
how fast current pixel should go from its source position to its destination. 
* `index_of_pixel` - just defines a sequential index, so that shader can read color of this pixel
in the source image.

The initialization of this array happens in just one pass, and it looks like this:

```
pixel_attributes = [];

for each pixel p:
  bucket_number = get_bucket_number_for(p)
  increase_number_of_pixels_in_bucket(bucket_number)

  pixel_attributes[idx + 0] = bucket_number
  pixel_attributes[idx + 1] = number_of_pixels_in_bucket(bucket_number)
  pixel_attributes[idx + 2] = random()
  pixel_attributes[idx + 3] = idx

  idx += 4
```

There is one caveat. Even a simple `640 x 640` pixels image has mor than `400,000` pixels.
Processing them all at once will likely take longer than `16ms` on mobile devices.
This will result in "lagging" UI thread (any existing animation will appear to be jagged).

To address this, we need to pause processing and resume it on the next event loop cycle.
Here is a simplified idea:

``` js
var lastProcessedIndex = 0;

function processChunk() {
  var start = window.performance.now();

  while (lastProcessedIndex < numberOfPixels) {
    processPixel(lastProcessedIndex);
    lastProcessedIndex += 1;
    if (window.performance.now() - start > 12) {
      // We've exceeded allowed time quota of 12ms
      // Schedule processing for the next event loop cycle
      setTimeout(processChunk, 0);
      // And quit from this loop
      return;
    }
  }
  // when  code reaches here, it means we are done
  // so we can call a callback, or resolve a promise to notify the consumers.
}
```

Cumulatively, this way requires more time. But perceived performance will still
be better.

### Animation

To advance particle from `A` to `B` over time `t` we need to know what time `t` is.

A very simple technique is to use linear interpolation:

```
current_position = A * (1 - t) + t * B
```

As `t` goes from `0` to `1` `A` get closer to 0 and `B` gets closer to its full value.

Updating time for each particle on a CPU would require a lot of work, so instead,
I'm assigning a random value for a particle's lifespan, and then use just one global
counter to tell the shader what time it is now. The shader then performs interpolation
according to the particle's lifespan.

Originally I tried to use a regular `Math.random()` to initialize particle's lifespan.
But I didn't like the results very much. Sampling lifespan from Gaussian distribution
gives more natural feel. Compare:

![uniform](https://i.imgur.com/QvgYXQN.gif) ![gaussian](https://i.imgur.com/1fQgmJI.gif)

Image on the left uses regular `Math.random()`, while image on the right 
uses gaussian distribution. Which one you like better?

## CORS

Due to security restrictions, we can play only CORS-enabled images. Which means
images from websites like wikipedia or imgur can be animated, while images from
pinterest will likely not load.


# Local Development

```
git clone https://github.com/anvaka/pixchart.git 
cd pixchart

npm install
npm start
```

# License
MIT
