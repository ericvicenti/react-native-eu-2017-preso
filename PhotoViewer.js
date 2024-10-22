import React from "react";
import PropTypes from "prop-types";
import ReactNative, {
  Animated,
  StyleSheet,
  Text,
  Easing,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  BackHandler,
  Platform,
  TouchableWithoutFeedback
} from "react-native";
import PinchView from "./PinchView";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const ANIM_DURATION = 700;

class PhotoPane extends React.Component {
  _doubleTapTimeout: ?number = null;
  _handlePaneTap = e => {
    const {
      width,
      height,
      onHideOverlay,
      onShowOverlay,
      onToggleOverlay
    } = this.props;
    const { nativeEvent } = e;
    if (this._doubleTapTimeout) {
      clearTimeout(this._doubleTapTimeout);
      this._doubleTapTimeout = null;
      return;
    }
    this._doubleTapTimeout = setTimeout(() => {
      this._doubleTapTimeout = null;
      onToggleOverlay();
    }, 270);
  };
  render() {
    const { photo, width, height, transitionProgress } = this.props;
    const aspectRatio = photo.width / photo.height;
    const maxWidth = width.__getValue();
    const maxHeight = height.__getValue();
    const screenAspectRatio = maxWidth / maxHeight;
    let photoSize = null;
    if (aspectRatio > screenAspectRatio) {
      photoSize = { width: maxWidth, height: maxWidth / aspectRatio };
    } else {
      photoSize = { height: maxHeight, width: maxHeight * aspectRatio };
    }
    return (
      <Animated.View
        style={{
          opacity: transitionProgress
            ? transitionProgress.interpolate({
                inputRange: DEST_OPACITY_RANGE,
                outputRange: [0, 1]
              })
            : 1
        }}
      >
        <Animated.View
          style={[
            styles.innerPane,
            {
              width,
              height
            }
          ]}
        >
          <TouchableWithoutFeedback onPress={this._handlePaneTap}>
            <Animated.View
              style={{
                width,
                height,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Animated.Image
                style={{
                  width: photoSize.width,
                  height: photoSize.height
                }}
                ref={i => {
                  this._image = i;
                }}
                source={photo.source}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </Animated.View>
    );
  }
}

const TRANS_START = 0;
const TRANS_IN_READY = 0.01;
const TRANS_IN_START = 0.015;
const TRANS_IN_DONE = 0.02;
const OUT_MARGIN = Platform.OS === "ios" ? 0.001 : 0.01;
const TRANS_OUT_START = 1 - OUT_MARGIN * 2;
const TRANS_OUT_DONE = 1 - OUT_MARGIN;
const TRANS_DONE = 1;

const MOVEMENT_RANGE = [TRANS_IN_DONE, TRANS_OUT_START];
const INLINE_OPACITY_RANGE = [TRANS_IN_START, TRANS_IN_DONE];
const DEST_OPACITY_RANGE = [TRANS_OUT_START, TRANS_OUT_DONE];
const SHARED_OPACITY_RANGE = [
  TRANS_IN_READY,
  TRANS_IN_START,
  TRANS_OUT_DONE,
  TRANS_DONE
];

const ENABLE_GESTURE_DISMISS = Platform.OS === "ios";

class InnerViewer extends React.Component {
  state = {
    width: new Animated.Value(Dimensions.get("window").width),
    height: new Animated.Value(Dimensions.get("window").height),
    overlayOpacity: new Animated.Value(this.props.isOverlayOpen ? 1 : 0),
    openProgress: new Animated.Value(0),
    dismissProgress: null,
    dismissScrollProgress: ENABLE_GESTURE_DISMISS
      ? new Animated.Value(Dimensions.get("window").height)
      : null,
    inlineImageMeasurements: null,
    openImageMeasurements: null,
    isFirstPass: true
  };
  _isOverlayVisible = this.props.isOverlayOpen;

  componentDidMount() {
    this._setSourceOpacity(this.state.openProgress);
    const { photoKey } = this.props;
    this._measurePhoto(photoKey);
    BackHandler.addEventListener("hardwareBackPress", this.close);
  }
  _measurePhoto = photoKey => {
    const openImageMeasurements = this._getDestMeasurements(photoKey);
    const { measurer } = this.props.getSourceContext(photoKey);
    measurer().then(measurements => {
      this.setState(
        {
          inlineImageMeasurements: measurements,
          openImageMeasurements
        },
        () => {
          this.state.isFirstPass && this.setState({ isFirstPass: false });
        }
      );
    });
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.close);
    const { setOpacity } = this.props.getSourceContext(this.props.photoKey);
    setOpacity(1);
  }

  _setSourceOpacity(progress) {
    const { setOpacity } = this.props.getSourceContext(this.props.photoKey);
    setOpacity(
      progress.interpolate({
        inputRange: INLINE_OPACITY_RANGE,
        outputRange: [1, 0]
      })
    );
  }

  _getDestMeasurements(photoKey) {
    const { photos } = this.props;
    const height = this.state.height.__getValue();
    const width = this.state.width.__getValue();
    const photo = photos.find(p => p.key === photoKey);
    const aspectRatio = photo.width / photo.height;
    const screenAspectRatio = width / height;
    let destWidth = width;
    let destHeight = width / aspectRatio;
    if (aspectRatio - screenAspectRatio < 0) {
      destHeight = height;
      destWidth = height * aspectRatio;
    }
    let destX = (width - destWidth) / 2;
    let destY = (height - destHeight) / 2;
    const openImageMeasurements = {
      width: destWidth,
      height: destHeight,
      x: destX,
      y: destY
    };
    return openImageMeasurements;
  }

  onShowOverlay = () => {
    this.props.setOverlay(true);
  };
  onHideOverlay = () => {
    this.props.setOverlay(false);
  };
  onToggleOverlay = () => {
    this.props.setOverlay(!this.props.isOverlayOpen);
  };
  _animateOverlayOpacity(isVisible) {
    Animated.timing(this.state.overlayOpacity, {
      toValue: isVisible ? 1 : 0,
      useNativeDriver: true,
      duration: 500
    }).start();
    this._isOverlayVisible = isVisible;
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.photoKey !== nextProps.photoKey) {
      const lastInlinePhotoContext = this.props.getSourceContext(
        this.props.photoKey
      );
      lastInlinePhotoContext.setOpacity(1);
      const nextInlinePhotoContext = this.props.getSourceContext(
        nextProps.photoKey
      );
      const { transitionProgress } = this._getTransitionProgress();
      nextInlinePhotoContext.setOpacity(
        transitionProgress.interpolate({
          inputRange: INLINE_OPACITY_RANGE,
          outputRange: [1, 0]
        })
      );
      this.setState(
        {
          inlineImageMeasurements: null,
          openImageMeasurements: null
        },
        () => this._measurePhoto(nextProps.photoKey)
      );
    }
  }

  componentDidUpdate(lastProps, lastState) {
    const { isOverlayOpen } = this.props;
    if (lastProps.isOverlayOpen !== isOverlayOpen) {
      this._animateOverlayOpacity(isOverlayOpen);
      this._isOverlayVisible = isOverlayOpen;
    }
    if (
      // Handle initial photo opening:
      this.state.openProgress &&
      !(lastState.inlineImageMeasurements && lastState.openImageMeasurements) &&
      this.state.openImageMeasurements &&
      this.state.inlineImageMeasurements
    ) {
      Animated.timing(this.state.openProgress, {
        toValue: 1,
        duration: ANIM_DURATION,
        easing: Easing.inOut(Easing.poly(3)),
        useNativeDriver: true
      }).start(() => {
        this.onShowOverlay();
        this.setState(
          {
            openProgress: null
          },
          () => {
            this._setSourceOpacity(
              this._getTransitionProgress().transitionProgress
            );
          }
        );
      });
    }
  }
  close = async () => {
    this.onHideOverlay();
    const dismissProgress = new Animated.Value(1);
    this._setSourceOpacity(dismissProgress);
    const { photoKey } = this.props;
    const openImageMeasurements = this._getDestMeasurements(photoKey);
    const { measurer } = this.props.getSourceContext(this.props.photoKey);
    const inlineImageMeasurements = await measurer();
    this.setState(
      {
        dismissProgress,
        inlineImageMeasurements,
        openImageMeasurements
      },
      () => {
        Animated.timing(dismissProgress, {
          toValue: 0,
          duration: ANIM_DURATION,
          useNativeDriver: true
        }).start(() => {
          if (Platform.OS === "ios") {
            this.props.onClose();
          } else {
            setTimeout(() => {
              this.props.onClose();
            }, 50);
          }
        });
      }
    );
  };
  render() {
    const {
      photos,
      photoKey,
      onPhotoKeyChange,
      renderOverlay,
      setOverlay,
      isOverlayOpen
    } = this.props;
    const onClose = this.close;

    let overlay = (
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    );

    const photo = photos.find(p => p.key === photoKey);

    if (renderOverlay) {
      overlay = renderOverlay({ photo, onClose });
    }

    const {
      width,
      height,
      overlayOpacity,
      openProgress,
      inlineImageMeasurements,
      openImageMeasurements,
      dismissScrollProgress,
      dismissProgress,
      isFirstPass
    } = this.state;

    let openingInitScale = 0;
    let openingInitTranslateX = 0;
    let openingInitTranslateY = 0;
    let inlineAspectX = 1;
    let inlineAspectY = 1;
    if (inlineImageMeasurements && openImageMeasurements) {
      const aspectRatio = photo.width / photo.height;
      const screenAspectRatio = width.__getValue() / height.__getValue();
      if (aspectRatio - screenAspectRatio > 0) {
        const maxDim = openImageMeasurements.width;
        const srcShortDim = inlineImageMeasurements.height;
        const srcMaxDim = srcShortDim * aspectRatio;
        openingInitScale = srcMaxDim / maxDim;
        inlineAspectX =
          inlineImageMeasurements.width /
          inlineImageMeasurements.height /
          aspectRatio;
        inlineAspectY = aspectRatio;
      } else {
        const maxDim = openImageMeasurements.height;
        const srcShortDim = inlineImageMeasurements.width;
        const srcMaxDim = srcShortDim / aspectRatio;
        openingInitScale = srcMaxDim / maxDim;
        inlineAspectX = 1 / aspectRatio;
        inlineAspectY =
          aspectRatio *
          inlineImageMeasurements.height /
          inlineImageMeasurements.width;
      }
      const translateInitY =
        inlineImageMeasurements.y + inlineImageMeasurements.height / 2;
      const translateDestY =
        openImageMeasurements.y + openImageMeasurements.height / 2;
      openingInitTranslateY = translateInitY - translateDestY;
      const translateInitX =
        inlineImageMeasurements.x + inlineImageMeasurements.width / 2;
      const translateDestX =
        openImageMeasurements.x + openImageMeasurements.width / 2;
      openingInitTranslateX = translateInitX - translateDestX;
    }
    const {
      transitionProgress,
      innerViewerOpacity,
      outerViewerOpacity
    } = this._getTransitionProgress();
    let translateY = transitionProgress.interpolate({
      inputRange: MOVEMENT_RANGE,
      outputRange: [openingInitTranslateY, 0]
    });
    if (dismissScrollProgress) {
      translateY = Animated.add(
        translateY,
        Animated.multiply(
          dismissScrollProgress.interpolate({
            inputRange: [0, height.__getValue(), height.__getValue() * 2],
            outputRange: [300, 0, -300]
          }),
          dismissScrollProgress.interpolate({
            inputRange: [
              0,
              height.__getValue() * 0.5,
              height.__getValue(),
              height.__getValue() * 1.5,
              height.__getValue() * 2
            ],
            outputRange: [0, 1, 1, 1, 0]
          })
        )
      );
    }
    return (
      <Animated.View
        style={[styles.outerViewer]}
        onLayout={Animated.event(
          [
            {
              nativeEvent: {
                layout: { width, height }
              }
            }
          ],
          {
            listener: e => {
              // todo: this is needed for re-orienting, but causes bugs
              /* if (this.flatList && initialIndex != null) {
                this.flatList.scrollToIndex({
                  index: initialIndex,
                  viewPosition: 0
                });
              } */
            }
          }
        )}
      >
        {!isFirstPass &&
          <Animated.View
            style={[styles.viewer, { opacity: outerViewerOpacity }]}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "black", opacity: innerViewerOpacity }
              ]}
            />
            {this._renderDismissScrollView()}
            <Animated.View
              pointerEvents={isOverlayOpen ? "box-none" : "none"}
              style={[{ opacity: overlayOpacity }, StyleSheet.absoluteFill]}
            >
              {overlay}
            </Animated.View>
          </Animated.View>}

        {inlineImageMeasurements &&
          openImageMeasurements &&
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: openImageMeasurements.width,
              height: openImageMeasurements.height,
              left: openImageMeasurements.x,
              top: openImageMeasurements.y,
              overflow: "hidden",
              backgroundColor: "transparent",
              opacity: transitionProgress.interpolate({
                inputRange: SHARED_OPACITY_RANGE,
                outputRange: [0, 1, 1, 0]
              }),
              transform: [
                {
                  translateX: transitionProgress.interpolate({
                    inputRange: MOVEMENT_RANGE,
                    outputRange: [openingInitTranslateX, 0]
                  })
                },
                {
                  translateY
                },
                {
                  scale: transitionProgress.interpolate({
                    inputRange: MOVEMENT_RANGE,
                    outputRange: [openingInitScale, 1]
                  })
                },

                {
                  scaleX: transitionProgress.interpolate({
                    inputRange: MOVEMENT_RANGE,
                    outputRange: [inlineAspectX, 1]
                  })
                },
                {
                  scaleY: transitionProgress.interpolate({
                    inputRange: MOVEMENT_RANGE,
                    outputRange: [inlineAspectY, 1]
                  })
                }
              ]
            }}
          >
            <Animated.Image
              source={photo.source}
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "transparent",
                transform: [
                  {
                    scaleX: transitionProgress.interpolate({
                      inputRange: MOVEMENT_RANGE,
                      outputRange: [1 / inlineAspectX, 1]
                    })
                  },
                  {
                    scaleY: transitionProgress.interpolate({
                      inputRange: MOVEMENT_RANGE,
                      outputRange: [1 / inlineAspectY, 1]
                    })
                  }
                ]
              }}
            />
          </Animated.View>}
      </Animated.View>
    );
  }
  _renderDismissScrollView() {
    if (!ENABLE_GESTURE_DISMISS) {
      return this._renderFlatList();
    }
    const { photos, photoKey, onPhotoKeyChange } = this.props;
    const { width, height } = this.state;
    const photo = photos.find(p => p.key === photoKey);
    return (
      <Animated.ScrollView
        pagingEnabled={true}
        scrollEventThrottle={1}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: { y: this.state.dismissScrollProgress }
              }
            }
          ],
          {
            useNativeDriver: true,
            listener: value => {
              const yOffset = value.nativeEvent.contentOffset.y;
              const heightValue = height.__getValue();
              if (yOffset <= 0 || yOffset >= 2 * heightValue) {
                this.props.onClose();
              }
              if (yOffset === heightValue) {
                if (!this._isOverlayVisible && this.props.isOverlayOpen) {
                  this._animateOverlayOpacity(true);
                }
              } else if (this._isOverlayVisible) {
                this._animateOverlayOpacity(false);
              }
            }
          }
        )}
        contentOffset={{ x: 0, y: height.__getValue() }}
      >
        <Animated.View style={{ width, height }} />
        {this._renderFlatList()}
        <Animated.View style={{ width, height }} />
      </Animated.ScrollView>
    );
  }

  _getTransitionProgress() {
    const {
      openProgress,
      dismissProgress,
      dismissScrollProgress,
      height
    } = this.state;

    const outerViewerOpacity = openProgress || 1;
    let gestureDismissProgress = ENABLE_GESTURE_DISMISS
      ? dismissScrollProgress.interpolate({
          inputRange: [0, height.__getValue(), height.__getValue() * 2],
          outputRange: [TRANS_IN_DONE, TRANS_DONE, TRANS_IN_DONE]
        })
      : null;
    if (dismissProgress) {
      gestureDismissProgress = dismissProgress;
    }
    const transitionProgress =
      openProgress ||
      dismissProgress ||
      gestureDismissProgress ||
      new Animated.Value(1);

    return {
      innerViewerOpacity: gestureDismissProgress,
      transitionProgress,
      outerViewerOpacity
    };
  }
  _renderFlatList() {
    const { width, height, openProgress, dismissProgress } = this.state;
    const { photos, photoKey, onPhotoKeyChange } = this.props;
    const photo = photos.find(p => p.key === photoKey);
    const initialIndex = photos.findIndex(p => p.key === photoKey);
    const { transitionProgress } = this._getTransitionProgress();
    return (
      <FlatList
        scrollEnabled={!openProgress && !dismissProgress}
        ref={fl => {
          this.flatList = fl;
        }}
        style={styles.hScroll}
        horizontal={true}
        pagingEnabled={true}
        data={photos}
        initialNumToRender={1}
        onViewableItemsChanged={({ viewableItems }) => {
          const item = viewableItems[0];
          if (
            !openProgress &&
            !dismissProgress &&
            item &&
            item.key !== photoKey
          ) {
            onPhotoKeyChange(item.key);
          }
        }}
        renderItem={({ item }) => {
          return (
            <PhotoPane
              transitionProgress={transitionProgress}
              onToggleOverlay={this.onToggleOverlay}
              onShowOverlay={this.onShowOverlay}
              onHideOverlay={this.onHideOverlay}
              photo={item}
              width={width}
              height={height}
            />
          );
        }}
        getItemLayout={(data, index) => ({
          length: width.__getValue(),
          index,
          offset: index * width.__getValue()
        })}
        initialScrollIndex={initialIndex}
      />
    );
  }
}

class PhotoViewerPhoto extends React.Component {
  state = {
    opacity: new Animated.Value(1)
  };
  static contextTypes = {
    onSourceContext: PropTypes.func
  };
  componentWillMount() {
    const { photo } = this.props;
    this.context.onSourceContext(photo.key, this.measure, this.setOpacity);
  }
  setOpacity = opacity => {
    this.setState({ opacity });
  };
  measure = async () => {
    if (!this._imageRef && !this._readyToMeasure) {
      console.error("measuring before its ready!");
    }
    return new Promise((resolve, reject) => {
      this._imageRef
        .getNode()
        .measure((imgX, imgY, imgWidth, imgHeight, imgPageX, imgPageY) => {
          resolve({
            width: imgWidth,
            height: imgHeight,
            x: imgPageX,
            y: imgPageY
          });
        }, reject);
    });
  };
  render() {
    const { style, photo } = this.props;
    const { opacity } = this.state;
    return (
      <Animated.Image
        style={[style, { opacity }]}
        resizeMode="cover"
        source={photo.source}
        ref={i => {
          this._imageRef = i;
        }}
        onLayout={() => {
          this._readyToMeasure = true;
        }}
      />
    );
  }
}

type PhotoSource = { uri: string, cache: "force-cache" };

type Photo = {
  key: string,
  width: number,
  height: number,
  source: PhotoSource
};

export default class PhotoViewer extends React.Component {
  static Photo = PhotoViewerPhoto;

  state = {
    photos: null,
    key: null,
    isOverlayOpen: false
  };

  _imageMeasurers: { [key: string]: () => void } = {};
  _imageOpacitySetters: {
    [key: string]: (opacity: Animated.Value) => void
  } = {};

  static childContextTypes = {
    onSourceContext: PropTypes.func
  };

  getChildContext() {
    return { onSourceContext: this._onSourceContext };
  }

  _onSourceContext = (key, imageMeasurer, setOpacity) => {
    this._imageMeasurers[key] = imageMeasurer;
    this._imageOpacitySetters[key] = setOpacity;
  };

  _getSourceContext = (key: string) => {
    return {
      measurer: this._imageMeasurers[key],
      setOpacity: this._imageOpacitySetters[key]
    };
  };

  open = (photos, key) => {
    this.setState(() => ({ photos, key, isOverlayOpen: false }));
  };

  close = () => {
    this.setState({ photos: null, key: null });
  };

  changePhoto = key => {
    this.setState({ key });
  };

  setOverlay = isOverlayOpen => {
    this.setState({ isOverlayOpen });
  };

  render() {
    const { photos, key, isOverlayOpen } = this.state;
    const { renderOverlay } = this.props;
    return (
      <View style={{ flex: 1 }}>
        {this.props.renderContent({ onPhotoOpen: this.open })}
        {photos &&
          <InnerViewer
            photos={photos}
            photoKey={key}
            getSourceContext={this._getSourceContext}
            onClose={this.close}
            renderOverlay={renderOverlay}
            isOverlayOpen={isOverlayOpen}
            setOverlay={this.setOverlay}
            onPhotoKeyChange={this.changePhoto}
          />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  closeText: { color: "white", backgroundColor: "transparent" },
  closeButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    position: "absolute",
    top: 20,
    left: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "white",
    borderRadius: 5
  },
  viewer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent"
  },
  closeButtonWrapper: {
    flex: 1
  },
  innerPane: {
    justifyContent: "center",
    alignItems: "center"
  },
  hScroll: { flex: 1 },
  outerViewer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
});
