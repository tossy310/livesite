import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import shallowCompare from 'react-addons-shallow-compare';

import FixedRatioThumbnail from './FixedRatioThumbnail';

const DEFAULT_TEAM = {
  id: 'null',
  name: '???',
  university: '???',
  members: [],
};

const LegendProblemCol = ({ problem: { label, title, color = 'black' } }) => {
  return (
    <th className="team-problem">
      <span title={title}>
        {label}
      </span>
      <span className="team-problem-flag">
        <span className="glyphicon glyphicon-flag" style={{ color }} />
      </span>
    </th>
  );
};

const LegendRowSimple = ({ problems }) => {
  return (
    <li className="team-row legend">
      <table className="team-table">
        <tbody>
          <tr>
            <th className="team-mark"></th>
            <th className="team-rank">#</th>
            <th className="team-name">チーム</th>
            <th className="team-name">大学</th>
            <th className="team-solved">正答数</th>
            <th className="team-penalty">ペナルティ</th>
            <th />
          </tr>
        </tbody>
      </table>
    </li>
  );
};

const LegendRowDetailed = ({ problems }) => {
  const problemCols = [];
  if (problems.length > 0) {
    problems.forEach((problem) => {
      problemCols.push(<LegendProblemCol problem={problem} />);
    });
  } else {
    problemCols.push(<th />);
  }
  return (
    <li className="team-row legend">
      <table className="team-table">
        <tbody>
          <tr>
            <th className="team-mark"></th>
            <th className="team-rank">#</th>
            <th className="team-name">チーム/大学</th>
            <th className="team-solved">正答数</th>
            {problemCols}
          </tr>
        </tbody>
      </table>
    </li>
  );
};

class TeamCol extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  render() {
    const { text, small, to, ...rest } = this.props;
    const content = <span>{text}<br /><small>{small}</small></span>;
    const inner =
        to ? <Link to={to} className="no-decoration">{content}</Link> : content;
    return <td {...rest}>{inner}</td>;
  }
};

const TeamProblemCol = ({ problem: { attempts, penalty, pendings, solved } }) => {
  let status;
  let content;
  if (solved) {
    status = 'solved';
    content = (
      <span>
        {attempts}
        <br /><small>({ penalty })</small>
      </span>
    );
  } else {
    if (pendings > 0) {
      status = 'pending';
    } else if (attempts > 0) {
      status = 'rejected';
    } else {
      status = 'unattempted';
    }
    content = (
      <span>
        {attempts}
        <br /><small>&nbsp;</small>
      </span>
    );
  }
  return (
    <td className="team-problem">
      <div className="team-problem-cell">
        <div className={`team-problem-cell-bg ${status}`} />
        <div className="team-problem-cell-fg">{content}</div>
      </div>
    </td>
  );
};

const TeamPinCol = ({ pinned, onClick }) => {
  const className =
    'glyphicon glyphicon-pushpin' + (pinned ? ' pinned' : '');
  return (
    <td className="team-mark">
      <span className={className} onClick={onClick} />
    </td>
  );
};

const TeamRowSimple = (props) => {
  const { status, team, pinned, onClickPin, className = '', ...rest } = props;
  const { rank, solved, penalty } = status;
  const { id, name, university } = team;
  const rewrittenClassName = 'team-row ' + className;
  return (
    <li className={rewrittenClassName} {...rest}>
      <table className="team-table">
        <tbody>
          <tr>
            <TeamPinCol pinned={pinned} onClick={onClickPin} />
            <TeamCol className="team-rank" text={rank} />
            <TeamCol className="team-name" text={name} to={`/team/${id}`} />
            <TeamCol className="team-name" text={university} to={`/team/${id}`} />
            <TeamCol className="team-solved" text={solved} />
            <TeamCol className="team-penalty" text={`(${penalty})`} />
            <td />
          </tr>
        </tbody>
      </table>
    </li>
  );
};

const TeamRowDetailed = (props) => {
  const { status, team, pinned, onClickPin, className = '', ...rest } = this.props;
  const { rank, solved, penalty, problems = [] } = status;
  const { id, name, university } = team;
  const rewrittenClassName = 'team-row ' + className;
  const problemCols = [];
  if (problems.length > 0) {
    problems.forEach((problem) => {
      problemCols.push(<TeamProblemCol problem={problem} />);
    });
  } else {
    problemCols.push(<td />);
  }
  return (
    <li className={rewrittenClassName} {...rest}>
      <table className="team-table">
        <tbody>
          <tr>
            <TeamPinCol pinned={pinned} onClick={onClickPin} />
            <TeamCol className="team-rank" text={rank} />
            <TeamCol className="team-name" text={name} small={university} to={`/team/${id}`} />
            <TeamCol className="team-solved" text={solved} small={`(${penalty})`} />
            {problemCols}
          </tr>
        </tbody>
      </table>
    </li>
  );
};

class AnimatingTeamRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { rankHidden: false, newSolved: false };
    this._timers = new Set();
  }

  setTimeout(callback, timeout) {
    const timer = setTimeout(() => {
      if (this._timers.has(timer)) {
        this._timers.delete(timer);
        callback();
      }
    }, timeout);
    this._timers.add(timer);
  }

  clearTimeouts() {
    this._timers.forEach((timer) => {
      clearTimeout(timer);
    });
    this._timers.clear();
  }

  animateForNewSolve() {
    this.setState({ rankHidden: true, newSolved: true });
    this.setTimeout(() => {
      this.setState({ newSolved: false });
    }, 9000);
    this.setTimeout(() => {
      this.setState({ rankHidden: false });
    }, 4000);
  }

  componentDidUpdate(prevProps) {
    if (this.props.status.solved != prevProps.status.solved) {
      this.animateForNewSolve();
    }
  }

  componentWillUnmount() {
    this.clearTimeouts();
  }

  render() {
    const { component: Component, className = '', status, ...rest } = this.props;
    const rewrittenClassName =
      this.state.newSolved ? className + ' new-solved' : className;
    const rewrittenStatus = Object.assign(
      {}, status, this.state.rankHidden ? {rank: '...'} : {});
    return <Component className={rewrittenClassName} status={rewrittenStatus} {...rest} />
  }
};

class AnimatingList extends React.Component {
  componentWillUpdate() {
    const liList = Array.from(this._dom.children);
    liList.forEach((li) => {
      li.classList.remove('animating');
      li.style.transform = undefined;
    });
    this._lastKeyToOffsetTop = new Map();
    liList.forEach((li, i) => {
      const child = this.props.children[i];
      this._lastKeyToOffsetTop.set(child.key, li.offsetTop);
    });
  }

  componentDidUpdate() {
    const liList = Array.from(this._dom.children);
    liList.forEach((li, i) => {
      li.style.zIndex = 9999 - i;
    });
    const currentKeyToOffsetTop = new Map();
    liList.forEach((li, i) => {
      const child = this.props.children[i];
      currentKeyToOffsetTop.set(child.key, li.offsetTop);
    });
    const rels = new Map();
    liList.forEach((li, i) => {
      const child = this.props.children[i];
      const currentOffsetTop = currentKeyToOffsetTop.get(child.key);
      const lastOffsetTop =
        this._lastKeyToOffsetTop.has(child.key) ?
        this._lastKeyToOffsetTop.get(child.key) :
        currentOffsetTop;
      const relativeOffsetTop = lastOffsetTop - currentOffsetTop;
      rels[child.key] = relativeOffsetTop;
      if (relativeOffsetTop != 0) {
        li.style.transform = `translate(0, ${relativeOffsetTop}px)`;
        setTimeout(() => {
          li.classList.add('animating');
          li.style.transform = 'translate(0, 0)';
        }, 1000);
      }
    });
  }

  render() {
    const { children, style, ...rest } = this.props;
    const rewrittenStyle = Object.assign({}, style, {position: 'relative'});
    return (
      <ul style={rewrittenStyle} {...rest} ref={(dom) => { this._dom = dom; }}>
        {children}
      </ul>
    );
  }
};

class StandingsTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClickPin(teamId) {
    this.props.togglePin(teamId);
  }

  render() {
    const { standings, teamsMap, problems, detailed, pinnedTeamIds } = this.props;
    const pinnedTeamIdSet = new Set(pinnedTeamIds);
    const TeamRow = detailed ? TeamRowDetailed : TeamRowSimple;
    const LegendRow = detailed ? LegendRowDetailed : LegendRowSimple;
    const normalRows = standings.map((status) => {
      const team = teamsMap[status.teamId] || DEFAULT_TEAM;
      return (
        <AnimatingTeamRow
          component={TeamRow}
          key={status.teamId}
          status={status}
          team={team}
          pinned={pinnedTeamIdSet.has(status.teamId)}
          onClickPin={() => this.handleClickPin(status.teamId)}
        />
      );
    });
    const pinnedStandings = standings.filter(
      (status) => pinnedTeamIdSet.has(status.teamId));
    const stickyRows = pinnedStandings.map((status) => {
      const team = teamsMap[status.teamId] || DEFAULT_TEAM;
      return (
        <AnimatingTeamRow
          component={TeamRow}
          status={status}
          team={team}
          pinned={true}
          onClickPin={() => this.handleClickPin(status.teamId)}
          className="sticky"
        />
      );
    });
    return (
      <div className="standings">
        <ul className="list-unstyled">
          <LegendRow problems={problems} />
        </ul>
        <ul className="list-unstyled">
          {stickyRows}
        </ul>
        <AnimatingList className="list-unstyled">
          {normalRows}
        </AnimatingList>
      </div>
    );
  }
};

export default StandingsTable;