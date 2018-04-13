import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, StyleSheet, NativeModules, findNodeHandle } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Server from '../server';
import {
  COLOR_NOTES_BLUE
} from '../utils/constants';

const UIManager = NativeModules.UIManager;

/**
 * Details: https://github.com/react-navigation/react-navigation/issues/1212
 */
class MoreMenu extends Component {
  onMenuPressed = (labels) => {
    const { navigation } = this.props;
    UIManager.showPopupMenu(
      findNodeHandle(this.menu),
      labels,
      () => {},
      (result, index) => {
        switch (index) {
          case 0:
            console.log('SHARE');
            break;
          case 1:
            // console.log('DELETE', navigation.state.params.rowId);
            // console.log(navigation.state.params.note);
            Server.delete(navigation.state.params.note).then(() => {
              navigation.navigate('ListPanel');
            });
            break;
        }
      },
    );
  };

  render() {
    const labels = ['Share', 'Delete'];

    return (
      <View style={{flexDirection: 'row'}}>
        <View>
          <View
            ref={c => this.menu = c}
            style={{
              backgroundColor: 'transparent',
              width: 1,
            }}
          />
          <MaterialIcons
            name="more-vert"
            onPress={() => this.onMenuPressed(labels)}
            style={{ marginRight: 10, color: COLOR_NOTES_BLUE }}
            size={30}
          />
        </View>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    state
  };
}

MoreMenu.propTypes = {
  state: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

export default connect(mapStateToProps)(MoreMenu)
