import GoogleBlockly from 'blockly/core';

export default class CdoTrashcan extends GoogleBlockly.Trashcan {
  createDom() {
    /* Here's the markup that will be generated:
    <g filter="url(#blocklyTrashcanShadowFilter)">
      <image width="100" height="100" href="media/canclosed.png"></image>
      <image width="100" height="100" visibility="hidden" href="media/canopen.png"></image>
      <line x0="0" y1="0" x2="100" y2="100" stroke="red" visibility="hidden"></line>
    </g>
  */
    this.svgGroup_ = Blockly.utils.dom.createSvgElement(
      'g',
      {class: 'blocklyTrash'},
      null
    );
    this.svgClosedCan_ = Blockly.utils.dom.createSvgElement(
      'image',
      {width: CdoTrashcan.WIDTH_, height: CdoTrashcan.HEIGHT_},
      this.svgGroup_
    );
    this.svgClosedCan_.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      CdoTrashcan.CLOSED_URL_
    );
    this.svgOpenCan_ = Blockly.utils.dom.createSvgElement(
      'image',
      {width: CdoTrashcan.WIDTH_, height: CdoTrashcan.HEIGHT_},
      this.svgGroup_
    );
    this.svgOpenCan_.setAttribute('visibility', 'hidden');
    this.svgOpenCan_.setAttributeNS(
      'http://www.w3.org/1999/xlink',
      'xlink:href',
      CdoTrashcan.OPEN_URL_
    );
    this.notAllowed_ = Blockly.utils.dom.createSvgElement(
      'g',
      {},
      this.svgGroup_
    );
    Blockly.utils.dom.createSvgElement(
      'line',
      {x1: 15, y1: 15, x2: 55, y2: 55, stroke: '#c00', 'stroke-width': 5},
      this.notAllowed_
    );
    Blockly.utils.dom.createSvgElement(
      'circle',
      {cx: 36, cy: 34, r: 28, stroke: '#c00', 'stroke-width': 5, fill: 'none'},
      this.notAllowed_
    );
    this.notAllowed_.setAttribute('visibility', 'hidden');
    return this.svgGroup_;
  }
  /**
   * Position the trashcan.
   * It is positioned in the opposite corner to the corner the
   * categories/toolbox starts at.
   */
  position() {
    // Not yet initialized.
    if (!this.verticalSpacing_) {
      return;
    }
    var metrics = this.workspace_.getMetrics();
    if (!metrics) {
      // There are no metrics available (workspace is probably not visible).
      return;
    }
    if (
      metrics.toolboxPosition == GoogleBlockly.TOOLBOX_AT_LEFT ||
      (this.workspace_.horizontalLayout && !this.workspace_.RTL)
    ) {
      // Toolbox starts in the left corner.
      this.left_ = Math.round(metrics.flyoutWidth / 2 - CdoTrashcan.WIDTH_ / 2);
    } else {
      // Toolbox starts in the right corner.
      this.left_ =
        this.MARGIN_SIDE_ + GoogleBlockly.Scrollbar.scrollbarThickness;
    }

    if (metrics.toolboxPosition == GoogleBlockly.TOOLBOX_AT_BOTTOM) {
      this.top_ = this.verticalSpacing_;
    } else {
      this.top_ = this.verticalSpacing_;
    }

    this.svgGroup_.setAttribute(
      'transform',
      'translate(' + this.left_ + ',' + this.top_ + ')'
    );
  }

  animateLid_() {
    if (this.isOpen) {
      this.svgOpenCan_.setAttribute('visibility', 'visible');
    } else {
      this.svgOpenCan_.setAttribute('visibility', 'hidden');
    }
  }
}

CdoTrashcan.CLOSED_URL_ = '/blockly/media/canclosed.png';
CdoTrashcan.OPEN_URL_ = '/blockly/media/canopen.png';
CdoTrashcan.WIDTH_ = 70;
CdoTrashcan.HEIGHT_ = 70;
