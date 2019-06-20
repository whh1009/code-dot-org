/* global p5 */
import {expect} from '../../../util/reconfiguredChai';
import {stub} from 'sinon';
import createGameLabP5 from '../../../util/gamelab/TestableGameLabP5';
import * as spriteUtils from '@cdo/apps/gamelab/spritelab/spriteUtils';

describe('Sprite Utils', () => {
  let gameLabP5, createSprite, animation;

  beforeEach(function() {
    gameLabP5 = createGameLabP5();
    createSprite = gameLabP5.p5.createSprite.bind(gameLabP5.p5);
    let image = new p5.Image(100, 100, gameLabP5.p5);
    let frames = [{name: 0, frame: {x: 0, y: 0, width: 50, height: 50}}];
    let sheet = new gameLabP5.p5.SpriteSheet(image, frames);
    animation = new gameLabP5.p5.Animation(sheet);
    spriteUtils.reset();
  });

  describe('Sprite Map', () => {
    it('sprite ids increase starting at 0', () => {
      let sprite1 = createSprite();
      let id1 = spriteUtils.addSprite(sprite1);
      expect(id1).to.equal(0);

      let sprite2 = createSprite();
      let id2 = spriteUtils.addSprite(sprite2);
      expect(id2).to.equal(1);

      let sprite3 = createSprite();
      let id3 = spriteUtils.addSprite(sprite3);
      expect(id3).to.equal(2);

      expect(spriteUtils.getSpriteIdsInUse()).to.have.members([0, 1, 2]);
    });

    it('deleting a sprite removes its id', () => {
      let sprite1 = createSprite();
      let id1 = spriteUtils.addSprite(sprite1);
      expect(spriteUtils.getSpriteIdsInUse()).to.have.members([0]);

      spriteUtils.deleteSprite(id1);
      expect(spriteUtils.getSpriteIdsInUse()).to.have.members([]);

      let sprite2 = createSprite();
      spriteUtils.addSprite(sprite2);
      expect(spriteUtils.getSpriteIdsInUse()).to.have.members([1]);
    });

    it('can get all animations in use', () => {
      let sprite1 = createSprite();
      let sprite2 = createSprite();
      let sprite3 = createSprite();
      sprite1.addAnimation('a', animation);
      sprite2.addAnimation('b', animation);
      sprite3.addAnimation('a', animation);
      spriteUtils.addSprite(sprite1);
      spriteUtils.addSprite(sprite2);
      spriteUtils.addSprite(sprite3);

      expect(spriteUtils.getAnimationsInUse()).to.have.members(['a', 'b']);
    });
  });

  describe('getSpriteArray', () => {
    it('works with ids', () => {
      let sprite1 = createSprite();
      let sprite2 = createSprite();
      let sprite3 = createSprite();
      let id1 = spriteUtils.addSprite(sprite1);
      let id2 = spriteUtils.addSprite(sprite2);
      let id3 = spriteUtils.addSprite(sprite3);

      expect(spriteUtils.getSpriteArray(id1)).to.have.members([sprite1]);
      expect(spriteUtils.getSpriteArray(id2)).to.have.members([sprite2]);
      expect(spriteUtils.getSpriteArray(id3)).to.have.members([sprite3]);
    });

    it('works with animation groups', () => {
      let sprite1 = createSprite();
      let sprite2 = createSprite();
      let sprite3 = createSprite();
      sprite1.addAnimation('a', animation);
      sprite2.addAnimation('b', animation);
      sprite3.addAnimation('a', animation);
      spriteUtils.addSprite(sprite1);
      spriteUtils.addSprite(sprite2);
      spriteUtils.addSprite(sprite3);

      expect(spriteUtils.getSpriteArray('a')).to.have.members([
        sprite1,
        sprite3
      ]);
      expect(spriteUtils.getSpriteArray('b')).to.have.members([sprite2]);
    });
  });

  describe('Behaviors', () => {
    it('Can add behaviors for a single sprite', () => {
      const behaviorLog = [];
      let sprite = createSprite();
      spriteUtils.addSprite(sprite);
      let behavior1 = {
        func: () => behaviorLog.push('behavior 1 ran'),
        name: 'behavior1'
      };
      let behavior2 = {
        func: () => behaviorLog.push('behavior 2 ran'),
        name: 'behavior2'
      };
      spriteUtils.addBehavior(sprite, behavior1);
      spriteUtils.addBehavior(sprite, behavior2);
      spriteUtils.runBehaviors();

      expect(behaviorLog).to.deep.equal(['behavior 1 ran', 'behavior 2 ran']);
    });

    it('can add behaviors with multiple sprites', () => {
      const behaviorLog = [];
      let sprite1 = createSprite();
      spriteUtils.addSprite(sprite1);
      let sprite2 = createSprite();
      spriteUtils.addSprite(sprite2);
      let behavior = {
        func: id => behaviorLog.push('behavior ran for sprite ' + id),
        name: 'behavior'
      };

      spriteUtils.addBehavior(sprite1, behavior);
      spriteUtils.addBehavior(sprite2, behavior);
      spriteUtils.runBehaviors();

      expect(behaviorLog).to.deep.equal([
        'behavior ran for sprite 0',
        'behavior ran for sprite 1'
      ]);
    });

    it('can remove individual behaviors', () => {
      const behaviorLog = [];
      let sprite0 = createSprite();
      spriteUtils.addSprite(sprite0);
      let sprite1 = createSprite();
      spriteUtils.addSprite(sprite1);
      let behavior1 = {
        func: id => behaviorLog.push('behavior 1 ran for sprite ' + id),
        name: 'behavior1'
      };
      let behavior2 = {
        func: id => behaviorLog.push('behavior 2 ran for sprite ' + id),
        name: 'behavior2'
      };

      spriteUtils.addBehavior(sprite0, behavior1);
      spriteUtils.addBehavior(sprite1, behavior1);
      spriteUtils.addBehavior(sprite0, behavior2);
      spriteUtils.addBehavior(sprite1, behavior2);
      spriteUtils.runBehaviors();

      spriteUtils.removeBehavior(sprite0, behavior1);
      spriteUtils.removeBehavior(sprite1, behavior2);
      spriteUtils.runBehaviors();

      expect(behaviorLog).to.deep.equal([
        // First tick:
        'behavior 1 ran for sprite 0',
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
        'behavior 2 ran for sprite 1',
        // Second tick:
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0'
      ]);
    });

    it('can remove all behaviors for a sprite', () => {
      const behaviorLog = [];
      let sprite0 = createSprite();
      spriteUtils.addSprite(sprite0);
      let sprite1 = createSprite();
      spriteUtils.addSprite(sprite1);
      let behavior1 = {
        func: id => behaviorLog.push('behavior 1 ran for sprite ' + id),
        name: 'behavior1'
      };
      let behavior2 = {
        func: id => behaviorLog.push('behavior 2 ran for sprite ' + id),
        name: 'behavior2'
      };

      spriteUtils.addBehavior(sprite0, behavior1);
      spriteUtils.addBehavior(sprite1, behavior1);
      spriteUtils.addBehavior(sprite0, behavior2);
      spriteUtils.addBehavior(sprite1, behavior2);
      spriteUtils.runBehaviors();

      spriteUtils.removeAllBehaviors(sprite0);
      spriteUtils.runBehaviors();

      expect(behaviorLog).to.deep.equal([
        // First tick:
        'behavior 1 ran for sprite 0',
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 0',
        'behavior 2 ran for sprite 1',
        // Second tick:
        'behavior 1 ran for sprite 1',
        'behavior 2 ran for sprite 1'
      ]);
    });
  });

  describe('Events', () => {
    it('Can run key events', () => {
      const keyWentDownStub = stub(gameLabP5.p5, 'keyWentDown').returns(true);
      const keyDownStub = stub(gameLabP5.p5, 'keyDown').returns(true);
      const eventLog = [];
      spriteUtils.addEvent('whenpress', {key: 'up'}, () =>
        eventLog.push('when up press ran')
      );
      spriteUtils.addEvent('whilepress', {key: 'down'}, () =>
        eventLog.push('while down press ran')
      );

      spriteUtils.runEvents(gameLabP5.p5);

      expect(eventLog).to.deep.equal([
        'when up press ran',
        'while down press ran'
      ]);

      keyWentDownStub.restore();
      keyDownStub.restore();
    });

    describe('Click events', () => {
      let eventLog, mouseWentDownStub, mouseIsOverStub, mousePressedOverStub;
      beforeEach(function() {
        eventLog = [];
        mouseWentDownStub = stub(gameLabP5.p5, 'mouseWentDown');
        mouseIsOverStub = stub(gameLabP5.p5, 'mouseIsOver');
        mousePressedOverStub = stub(gameLabP5.p5, 'mousePressedOver');
      });
      afterEach(function() {
        mouseWentDownStub.restore();
        mouseIsOverStub.restore();
        mousePressedOverStub.restore();
      });
      it('works with individual sprites', () => {
        mouseWentDownStub.returns(true);
        mouseIsOverStub.returns(true);
        mousePressedOverStub.returns(true);
        let id = spriteUtils.addSprite(createSprite());
        spriteUtils.addEvent('whenclick', {sprite: id}, () =>
          eventLog.push('when click ran')
        );
        spriteUtils.addEvent('whileclick', {sprite: id}, () =>
          eventLog.push('while click ran')
        );

        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when click ran', 'while click ran']);
      });

      it('works with animation groups', () => {
        mouseWentDownStub.returns(true);

        let sprite1 = createSprite();
        let sprite2 = createSprite();
        let sprite3 = createSprite();
        sprite1.addAnimation('a', animation);
        sprite2.addAnimation('b', animation);
        sprite3.addAnimation('a', animation);
        let id1 = spriteUtils.addSprite(sprite1);
        spriteUtils.addSprite(sprite2);
        spriteUtils.addSprite(sprite3);

        mouseIsOverStub.withArgs(sprite1).returns(true);
        mouseIsOverStub.withArgs(sprite2).returns(true);
        mouseIsOverStub.withArgs(sprite3).returns(false);

        spriteUtils.addEvent('whenclick', {sprite: 'a'}, extraArgs =>
          eventLog.push(extraArgs.sprite + ' was clicked')
        );

        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal([id1 + ' was clicked']);
      });
    });

    describe('Collision Events', () => {
      let eventLog, sprite, spriteId, target, targetId, overlapStub;
      beforeEach(function() {
        eventLog = [];
        sprite = createSprite();
        spriteId = spriteUtils.addSprite(sprite);
        target = createSprite();
        targetId = spriteUtils.addSprite(target);

        overlapStub = stub(sprite, 'overlap');
      });

      afterEach(function() {
        overlapStub.restore();
      });

      it('Can run collision events with individual sprites', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(true);
        spriteUtils.addEvent(
          'whentouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('when touch ran')
        );

        spriteUtils.addEvent(
          'whiletouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('while touch ran')
        );

        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran', 'while touch ran']);
      });

      it('Can run collision events with animation groups', () => {
        let sprite1 = createSprite();
        let sprite2 = createSprite();
        let sprite3 = createSprite();
        sprite1.addAnimation('a', animation);
        sprite2.addAnimation('b', animation);
        sprite3.addAnimation('a', animation);
        spriteUtils.addSprite(sprite1);
        spriteUtils.addSprite(sprite2);
        spriteUtils.addSprite(sprite3);

        spriteUtils.addEvent(
          'whentouch',
          {
            sprite1: 'a',
            sprite2: 'b'
          },
          () => eventLog.push('when touch ran')
        );

        spriteUtils.addEvent(
          'whiletouch',
          {
            sprite1: 'a',
            sprite2: 'b'
          },
          () => eventLog.push('while touch ran')
        );

        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran', 'while touch ran']);
      });

      it('while touching continues to call the callback', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(true);
        spriteUtils.addEvent(
          'whiletouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('while touch ran')
        );
        // First tick- expect the callback to be called
        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['while touch ran']);

        // Second tick- expect the callback to be called again
        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['while touch ran', 'while touch ran']);
      });

      it('when touching does not continue to call the callback', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(true);
        spriteUtils.addEvent(
          'whentouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('when touch ran')
        );
        // First tick- expect the callback to be called
        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran']);

        // Second tick- expect the callback not to be called again
        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran']);
      });

      it('when touching calls the callback again if the sprites stop and start touching', () => {
        overlapStub.onCall(0).returns(true);
        overlapStub.onCall(1).returns(false);
        overlapStub.onCall(2).returns(true);
        spriteUtils.addEvent(
          'whentouch',
          {
            sprite1: spriteId,
            sprite2: targetId
          },
          () => eventLog.push('when touch ran')
        );
        // First tick- expect the callback to be called
        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran']);

        // Second tick- expect the callback not to be called (overlap returns false)
        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran']);

        // Third tick- expect the callback to be called again
        spriteUtils.runEvents(gameLabP5.p5);
        expect(eventLog).to.deep.equal(['when touch ran', 'when touch ran']);
      });
    });
  });
});
