import React, {
  StyleSheet,
  Navigator,
  StatusBarIOS,
  View,
  Platform,
  PropTypes,
} from 'react-native';
import { EventEmitter } from 'fbemitter';

import NavBarContainer from './components/NavBarContainer';

const propTypes = {
  backButtonComponent: PropTypes.func,
  bgStyle: PropTypes.object,
  borderBottomWidth: PropTypes.number,
  borderColor: PropTypes.string,
  customAction: PropTypes.func,
  firstRoute: PropTypes.object.isRequired,
  headerStyle: PropTypes.any.isRequired,
  hideNavigationBar: PropTypes.bool,
  noStatusBar: PropTypes.bool,
  rightCorner: PropTypes.func,
  statusBarColor: PropTypes.string,
  titleStyle: PropTypes.any.isRequired,
};

class Router extends React.Component {
  constructor(props) {
    super(props);

    this.onForward = this.onForward.bind(this);
    this.onBack = this.onBack.bind(this);
    this.customAction = this.customAction.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.onDidFocus = this.onDidFocus.bind(this);
    this.onWillFocus = this.onWillFocus.bind(this);

    this.state = {
      route: {
        name: null,
        index: null,
      },
    };
    this.emitter = new EventEmitter();

    this.styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
      },
    });
  }

  onWillFocus(route) {
    this.setState({ route });
    this.emitter.emit('willFocus', route.name);
  }

  onDidFocus(route) {
    this.emitter.emit('didFocus', route.name);
  }

  onBack(navigator) {
    if (this.state.route.index > 0) {
      navigator.pop();
      this.emitter.emit('pop');
    }
  }

  onForward(nextRoute, navigator) {
    navigator.push(
      Object.assign(nextRoute, { index: this.state.route.index + 1 || 1 })
    );
    this.emitter.emit('push', nextRoute);
  }

  setRightProps(props) {
    this.setState({ rightProps: props });
  }

  setLeftProps(props) {
    this.setState({ leftProps: props });
  }

  setTitleProps(props) {
    this.setState({ titleProps: props });
  }

  customAction(opts) {
    this.props.customAction(opts);
  }

  configureScene(route) {
    return route.sceneConfig || Navigator.SceneConfigs.FloatFromRight;
  }

  renderScene(route, navigator) {
    const goForward = function goForward(nextRoute) {
      navigator.push(
        Object.assign(nextRoute, { index: this.state.route.index + 1 || 1 })
      );
      this.emitter.emit('push', nextRoute);
    }.bind(this);

    const replaceRoute = function replaceRoute(nextRoute) {
      navigator.replace(
        Object.assign(nextRoute, { index: this.state.route.index || 0 })
      );
      this.emitter.emit('replace', nextRoute);
    }.bind(this);

    const resetToRoute = function resetToRoute(nextRoute) {
      navigator.resetTo(
        Object.assign(nextRoute, { index: 0 })
      );
      this.emitter.emit('resetTo', nextRoute);
    }.bind(this);

    const goBackwards = function goBackwards() {
      this.onBack(navigator);
    }.bind(this);

    const goToFirstRoute = function goToFirstRoute() {
      navigator.popToTop();
      this.emitter.emit('popToTop');
    }.bind(this);

    const setRightProps = function setRightProps(props) {
      this.setState({ rightProps: props });
    }.bind(this);

    const setLeftProps = function setLeftProps(props) {
      this.setState({ leftProps: props });
    }.bind(this);

    const setTitleProps = function setTitleProps(props) {
      this.setState({ titleProps: props });
    }.bind(this);

    const customAction = function customAction(opts) {
      this.customAction(opts);
    }.bind(this);

    const Content = route.component;

    // Remove the margin of the navigation bar if not using navigation bar
    const extraStyling = {};
    if (this.props.hideNavigationBar) {
      extraStyling.marginTop = 0;
    }

    let margin;
    if (route.trans) {
      margin = 0;
    } else if (this.props.hideNavigationBar || route.hideNavigationBar) {
      margin = this.props.noStatusBar ? 0 : 20;
    } else {
      margin = 64;
    }

    this.toRoute = goForward;
    this.toBack = goBackwards;
    this.replaceRoute = replaceRoute;
    this.resetToRoute = resetToRoute;
    this.reset = goToFirstRoute;
    this.setRightProps = setRightProps;
    this.setLeftProps = setLeftProps;
    this.setTitleProps = setTitleProps;
    this.customAction = customAction;

    return (
      <View
        style={[this.styles.container, this.props.bgStyle, extraStyling, { marginTop: margin }]}
      >
        <Content
          name={route.name}
          index={route.index}
          data={route.data}
          toRoute={goForward}
          toBack={goBackwards}
          routeEmitter={this.emitter}
          replaceRoute={replaceRoute}
          resetToRoute={resetToRoute}
          reset={goToFirstRoute}
          setRightProps={setRightProps}
          setLeftProps={setLeftProps}
          setTitleProps={setTitleProps}
          customAction={customAction}
          {...route.passProps}
        />
      </View>
    );
  }

  render() {
    let navigationBar;
    // Status bar color
    if (Platform.OS === 'ios') {
      if (this.props.statusBarColor === 'black') {
        StatusBarIOS.setStyle(0);
      } else {
        StatusBarIOS.setStyle(1);
      }
    } else if (Platform.OS === 'android') {
      // no android version yet
    }

    if (!this.props.hideNavigationBar) {
      navigationBar = (
        <NavBarContainer
          style={this.props.headerStyle}
          navigator={navigator}
          currentRoute={this.state.route}
          backButtonComponent={this.props.backButtonComponent}
          rightCorner={this.props.rightCorner}
          titleStyle={this.props.titleStyle}
          borderBottomWidth={this.props.borderBottomWidth}
          borderColor={this.props.borderColor}
          toRoute={this.onForward}
          toBack={this.onBack}
          leftProps={this.state.leftProps}
          rightProps={this.state.rightProps}
          titleProps={this.state.titleProps}
          customAction={this.customAction}
          handleBackAndroid={this.props.handleBackAndroid}
        />
      );
    }

    return (
      <Navigator
        ref="navigator"
        initialRoute={this.props.firstRoute}
        navigationBar={navigationBar}
        renderScene={this.renderScene}
        onDidFocus={this.onDidFocus}
        onWillFocus={this.onWillFocus}
        configureScene={this.configureScene}
      />
    );
  }
}

Router.propTypes = propTypes;

export default Router;
