<div id="span">

# Span
| Syntax           | Preview        |
| ---------------- | -------------- |
| `[Span Content]` | [Span Content] |

</div>


# Components

## Simple usage

::code-preview

  :H3[Source]

  ```md
  ::alert
  The alert component.
  ::
  ```

#preview

  :H3[Preview]

  ::alert
  The alert component.
  ::
::


## With inline attributes

::code-preview

  :H3[Source]

  ```md
  ::alert{type=success}
  The alert component.
  ::
  ```

#preview

  :H3[Preview]

  ::alert{type=success}
  The alert component.
  ::
::


## With YAML attributes

::code-preview

  :H3[Source]

  ```md
  ::alert
  ---
  type: warning
  ---
  The alert component.
  ::
  ```

#preview

  :H3[Preview]

  ::alert
  ---
  type: warning
  ---
  The alert component.
  ::
::

## With inline styles (Not Recommended)

::code-preview

  :H3[Source]

  ```md
  ::alert{style="background: tomato; color: white"}
  The alert component.
  ::
  ```

#preview

  :H3[Preview]

  ::alert{style="background: tomato; color: white"}
  The alert component.
  ::
::
