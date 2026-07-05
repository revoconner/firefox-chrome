# Firefox UserChrome.css and UserChrome.js
### My personal firefox customisation

Not the prettiest by far, but pretty useful. I don't like form over function.

### Normal state (bookmark toolbar hidden)
<img width="1918" height="466" alt="image" src="https://github.com/user-attachments/assets/832e8dc5-19e8-496c-abea-c14c9bec2f56" />

----

### Hover on top (bookmark toolbar visible)
<img width="1915" height="524" alt="image" src="https://github.com/user-attachments/assets/5ffa3834-f804-4866-b345-0f0f6c9e2603" />

## The hover effect is done purely in css

Code for hover effect

```css
toolbox#navigator-toolbox.chrome-block {
  filter: brightness(75%);
  height: 5%;
  transition: filter 0.35s ease, height 0.35s ease;
  transition-delay: 0.5s;
}
toolbox#navigator-toolbox.chrome-block:hover {
  filter: brightness(100%);
  height: 7.5%;
  transition: filter 0.35s ease, height 0.3s ease;
	transition-delay: 0.1s;
}
```
