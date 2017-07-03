import tree from '../../../src/tree';
import widgets from './widgets';

export default class InexorHud {

  constructor() {
    this.root = new tree.Root();
    this.websocket = new WebSocket("ws://localhost:31416/api/v1/ws/tree");
    this.websocket.onmessage = this.onmessage.bind(this);

    this.widgets = [];
    
    this.paths = [];

    // TODO: load widgets using tree configuration
    this.addWidget(new widgets.TimeWidget(this));
    this.addWidget(new widgets.ScreenSizeWidget(this));
    
    setTimeout(this.init.bind(this), 200);

  }

  init() {
    for (let i = 0; i < this.paths.length; i += 1) {
      this.getNode(this.paths[i]);
    }
    this.render();
  }

  addWidget(widget) {
    this.widgets.push(widget);
  }

  getNode(path) {
    this.websocket.send(JSON.stringify({
      path: path
    }));
  }

  onmessage(event) {
    let request = JSON.parse(event.data);
    // console.log(request);
    let node;
    switch (request.state) {
      case 'add':
        try {
          node = this.root.createRecursive(request.path, request.datatype, request.value, true);
        } catch(err) {
          console.log(err);
        }
        break;
      case 'sync':
        node = this.root.findNode(request.path);
        if (node != null) {
          try {
            node.set(request.value);
          } catch(err) {
            console.log(err);
          }
        } else {
          try {
            node = this.root.createRecursive(request.path, request.datatype, request.value, true);
          } catch(err) {
            console.log(err);
          }
        }
        break;
      default:
        break;
    }
  }

  render() {
    for (let i = 0; i < this.widgets.length; i += 1) {
      this.widgets[i].render();
    }
  }

}
