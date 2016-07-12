/**
 * @license
 * Copyright 2016 Google Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Trackable} from 'neuroglancer/url_hash_state';
import {RefCounted} from 'neuroglancer/util/disposable';
import {Signal} from 'signals';

export class TrackableBoolean implements Trackable {
  get value() { return this.value_; }
  set value(newValue: boolean) {
    if (newValue !== this.value_) {
      this.value_ = newValue;
      this.changed.dispatch();
    }
  }
  toggle() { this.value = !this.value; }
  changed = new Signal();
  constructor(private value_: boolean, public defaultValue?: boolean) {}
  toJSON() {
    let {value_} = this;
    if (value_ === this.defaultValue) {
      return undefined;
    }
    return this.value_;
  }
  restoreState(x: any) {
    if (x === undefined) {
      x = this.defaultValue;
    }
    if (x === true || x === false) {
      this.value = x;
    }
  }
};

export class TrackableBooleanCheckbox extends RefCounted {
  element = document.createElement('input');
  constructor(public model: TrackableBoolean) {
    super();
    let {element} = this;
    element.type = 'checkbox';
    this.registerSignalBinding(model.changed.add(this.updateCheckbox, this));
    this.updateCheckbox();
    this.registerEventListener(element, 'change', function(this: typeof element, e: Event) {
      model.value = this.checked;
    });
  }

  updateCheckbox() { this.element.checked = this.model.value; }

  disposed() {
    let {element} = this;
    let {parentElement} = element;
    if (parentElement) {
      parentElement.removeChild(element);
    }
    super.disposed();
  }
};

export class ElementVisibilityFromTrackableBoolean extends RefCounted {
  constructor(public model: TrackableBoolean, public element: HTMLElement) {
    super();
    this.updateVisibility();
    this.registerSignalBinding(model.changed.add(() => { this.updateVisibility(); }));
  }

  updateVisibility() { this.element.style.display = this.model.value ? '' : 'none'; }
};
