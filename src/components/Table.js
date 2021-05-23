import HeaderCell from './HeaderCell';
import TableLoader from './loaders/Table';
import TableDeltaHelper from './snippets/TableDeltaHelper';

import {TABLE_FADE_IN, TABLE_FADE_OUT} from '../animations';
import {
  DISTRICT_TABLE_COUNT,
  STATE_NAMES,
  STATISTIC_CONFIGS,
  TABLE_STATISTICS,
  TABLE_STATISTICS_EXPANDED,
  UNASSIGNED_STATE_CODE,
} from '../constants';
import {
  getTableStatistic,
  parseIndiaDate,
  retry,
} from '../utils/commonFunctions';

import {
  FilterIcon,
  FoldDownIcon,
  InfoIcon,
  OrganizationIcon,
  QuestionIcon,
} from '@primer/octicons-react';
import classnames from 'classnames';
import {max} from 'date-fns';
import equal from 'fast-deep-equal';
import produce from 'immer';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
} from 'react';
import {
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
} from 'react-feather';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {useTrail, useTransition, animated, config} from 'react-spring';
import {useSessionStorage} from 'react-use';
// eslint-disable-next-line
import worker from 'workerize-loader!../workers/getDistricts';

function debounce(method, delay) {
  clearTimeout(method._tId);
  method._tId = setTimeout(function () {
    method();
  }, delay);
}

function handleScroll() {
  debounce(onScroll.bind(this), 100);
}

function handleXScroll() {
  debounce(onXScroll.bind(this), 100);
}

function onXScroll() {
  if (localStorage.getItem('sticked') === 'true') {
    const stickies = document.getElementsByClassName('sticky');
    Array.from(stickies).forEach((sticky) => {
      this.headers[sticky.firstChild.textContent] = {
        ele: sticky,
        left: sticky.getBoundingClientRect().left,
        width: sticky.getBoundingClientRect().width,
      };
    });
    Object.entries(this.headers).map(([_, config]) => {
      const {ele, left, width} = config;
      const clonedEle = ele.nextSibling;

      if (clonedEle?.classList?.contains('cloned')) {
        clonedEle.style.left = left + 'px';
        clonedEle.style.justifyContent = 'flex-start';
        const endsAtX = left + width;

        let fromRight = 0;
        let fromLeft = 0;

        if (endsAtX > this.clipEndAt) {
          fromRight = endsAtX - this.clipEndAt + 'px';
        } else if (left < this.clipStartAt) {
          fromLeft = this.clipStartAt - left + 'px';
        }
        clonedEle.style.clipPath = `inset(0 ${fromRight} 0 ${fromLeft})`;
      }
    });
  }
}

function onScroll() {
  if (window.scrollY > this.top && window.scrollY < this.bottom - 100) {
    if (
      localStorage.getItem('sticked') === 'false' ||
      localStorage.getItem('sticked') === null
    ) {
      const stickies = document.getElementsByClassName('sticky');

      Array.from(stickies).forEach((sticky) => {
        this.headers[sticky.firstChild.textContent] = {
          ele: sticky,
          left: sticky.getBoundingClientRect().left,
          width: sticky.getBoundingClientRect().width,
          height: sticky.getBoundingClientRect().height,
        };
      });
      const headerLength = Object.keys(this.headers).length;
      Object.entries(this.headers).map(([_, config], index) => {
        const {ele, left, width, height} = config;
        const styles = window.getComputedStyle(ele);
        const paddingLR =
          parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        const paddingTB =
          parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        const clonedHeader = ele.cloneNode(true);
        clonedHeader.classList.add('cloned');
        clonedHeader.classList.toggle('fixed', true);
        clonedHeader.style.left = left + 'px';
        clonedHeader.style.width = width - paddingLR + 'px';
        clonedHeader.style.height = height - paddingTB + 'px';
        clonedHeader.style.justifyContent = 'flex-start';
        clonedHeader.classList.remove('sticky');
        if (index === 0) {
          clonedHeader.style.zIndex = '100';
          clonedHeader.style.marginLeft = '-10px';
          clonedHeader.style.borderLeft = '10px solid #161625';
          clonedHeader.style.borderBottom = '4px solid #161625';
        } else {
          clonedHeader.style.zIndex = '99';
        }
        if (index === headerLength - 1) {
          clonedHeader.style.marginRight = '0';
        }
        const endsAtX = left + width;
        if (endsAtX > this.clipEndAt) {
          clonedHeader.style.clipPath = `inset(0 ${
            endsAtX - this.clipEndAt + 'px'
          } 0 0)`;
        }
        ele.after(clonedHeader);
        localStorage.setItem('sticked', true);
      });
    }
  } else if (localStorage.getItem('sticked') === 'true') {
    const clonedElements = document.getElementsByClassName('cloned');
    while (clonedElements[0]) {
      clonedElements[0].parentNode.removeChild(clonedElements[0]);
    }
    localStorage.setItem('sticked', false);
  }
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

let x = null;
let y = null;

const Row = lazy(() => retry(() => import('./Row')));

function Table({
  data: states,
  date: timelineDate,
  regionHighlighted,
  setRegionHighlighted,
  expandTable,
  setExpandTable,
  hideDistrictData,
  hideVaccinated,
}) {
  const {t} = useTranslation();
  const [sortData, setSortData] = useSessionStorage('sortData', {
    sortColumn: 'confirmed',
    isAscending: false,
    delta: false,
  });
  const [page, setPage] = useState(0);

  const handleSortClick = useCallback(
    (statistic) => {
      if (sortData.sortColumn !== statistic) {
        setSortData(
          produce(sortData, (draftSortData) => {
            draftSortData.sortColumn = statistic;
          })
        );
      } else {
        setSortData(
          produce(sortData, (draftSortData) => {
            draftSortData.isAscending = !sortData.isAscending;
          })
        );
      }
    },
    [sortData, setSortData]
  );

  const trail = useTrail(3, {
    from: {transform: 'translate3d(0, 10px, 0)', opacity: 0},
    to: {transform: 'translate3d(0, 0px, 0)', opacity: 1},
    config: config.wobbly,
  });

  const [districts, setDistricts] = useState();

  const [tableOption, setTableOption] = useState('States');
  const [isPerMillion, setIsPerMillion] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const numPages = Math.ceil(
    Object.keys(districts || {}).length / DISTRICT_TABLE_COUNT
  );

  const lastUpdatedTT = useMemo(() => {
    const updatedDates = [
      states['TT']?.meta?.['last_updated'] || timelineDate,
      states['TT']?.meta?.tested?.['last_updated'],
    ];
    return max(
      updatedDates.filter((date) => date).map((date) => parseIndiaDate(date))
    );
  }, [states, timelineDate]);

  const sortingFunction = useCallback(
    (regionKeyA, regionKeyB) => {
      if (sortData.sortColumn !== 'regionName') {
        const statisticConfig = STATISTIC_CONFIGS[sortData.sortColumn];
        const dataType =
          sortData.delta && statisticConfig.showDelta ? 'delta' : 'total';

        const statisticA = getTableStatistic(
          districts?.[regionKeyA] || states[regionKeyA],
          sortData.sortColumn,
          {perMillion: isPerMillion},
          lastUpdatedTT
        )[dataType];
        const statisticB = getTableStatistic(
          districts?.[regionKeyB] || states[regionKeyB],
          sortData.sortColumn,
          {perMillion: isPerMillion},
          lastUpdatedTT
        )[dataType];
        return sortData.isAscending
          ? statisticA - statisticB
          : statisticB - statisticA;
      } else {
        const regionNameA =
          districts?.[regionKeyA]?.districtName || STATE_NAMES[regionKeyA];
        const regionNameB =
          districts?.[regionKeyB]?.districtName || STATE_NAMES[regionKeyB];
        return sortData.isAscending
          ? regionNameA.localeCompare(regionNameB)
          : regionNameB.localeCompare(regionNameA);
      }
    },
    [
      districts,
      isPerMillion,
      lastUpdatedTT,
      sortData.delta,
      sortData.isAscending,
      sortData.sortColumn,
      states,
    ]
  );

  const _setTableOption = useCallback(() => {
    setTableOption((prevTableOption) =>
      prevTableOption === 'States' ? 'Districts' : 'States'
    );
  }, []);

  useEffect(() => {
    const workerInstance = worker();
    workerInstance.getDistricts(states);
    workerInstance.addEventListener('message', (message) => {
      if (message.data.type !== 'RPC') {
        setDistricts(message.data);
        workerInstance.terminate();
      }
    });
  }, [tableOption, states]);

  const previousVal = usePrevious({expandTable});

  useEffect(() => {
    const handleOnResize = () => {
      console.log('resized?');
      document.removeEventListener('scroll', x);
      document
        .getElementsByClassName('table-container')[0]
        .removeEventListener('scroll', y);
      const table = document
        .getElementsByClassName('table-container')[0]
        .getBoundingClientRect();
      const positions = {
        top: document.getElementsByClassName('table-container')[0].offsetTop,
        bottom:
          document.getElementsByClassName('table-container')[0].offsetTop +
          table.height,
        clipEndAt: table.x + table.width,
        clipStartAt: table.x,
        headers: {},
      };
      x = handleScroll.bind(positions);
      y = handleXScroll.bind(positions);
      document.addEventListener('scroll', x);
      document
        .getElementsByClassName('table-container')[0]
        .addEventListener('scroll', y);
      y();
    };
    window.addEventListener('resize', handleOnResize);
    return () => {
      window.removeEventListener('resize', handleOnResize);
    };
  }, []);

  useEffect(() => {
    if (previousVal && !equal(previousVal.expandTable, expandTable)) {
      setTimeout(() => {
        document.removeEventListener('scroll', x);
        document
          .getElementsByClassName('table-container')[0]
          .removeEventListener('scroll', y);
        const table = document
          .getElementsByClassName('table-container')[0]
          .getBoundingClientRect();
        const positions = {
          top: document.getElementsByClassName('table-container')[0].offsetTop,
          bottom:
            document.getElementsByClassName('table-container')[0].offsetTop +
            table.height,
          clipEndAt: table.x + table.width,
          clipStartAt: table.x,
          headers: {},
        };
        x = handleScroll.bind(positions);
        y = handleXScroll.bind(positions);
        document.addEventListener('scroll', x);
        document
          .getElementsByClassName('table-container')[0]
          .addEventListener('scroll', y);
      }, 500);
    } else if (previousVal) {
      setTimeout(() => {
        const table = document
          .getElementsByClassName('table-container')[0]
          .getBoundingClientRect();
        const positions = {
          top: document.getElementsByClassName('table-container')[0].offsetTop,
          bottom:
            document.getElementsByClassName('table-container')[0].offsetTop +
            table.height,
          clipEndAt: table.x + table.width,
          clipStartAt: table.x,
          headers: {},
        };
        x = handleScroll.bind(positions);
        y = handleXScroll.bind(positions);
        document.addEventListener('scroll', x);
        document
          .getElementsByClassName('table-container')[0]
          .addEventListener('scroll', y);
      }, 500);
    }

    return () => {
      document.removeEventListener('scroll', x);
      document
        .getElementsByClassName('table-container')[0]
        .removeEventListener('scroll', y);
    };
  }, [expandTable, previousVal]);

  useEffect(() => {
    setPage((p) => Math.max(0, Math.min(p, numPages - 1)));
  }, [numPages]);

  const handlePageClick = (direction) => {
    if (Math.abs(direction) === 1) {
      setPage(Math.min(Math.max(0, page + direction), numPages - 1));
    } else if (direction < 0) {
      setPage(0);
    } else if (direction > 0) {
      setPage(numPages - 1);
    }
  };

  const transition = useTransition(isInfoVisible, {
    from: TABLE_FADE_OUT,
    enter: TABLE_FADE_IN,
    leave: TABLE_FADE_OUT,
  });

  const tableStatistics = (expandTable
    ? TABLE_STATISTICS_EXPANDED
    : TABLE_STATISTICS
  ).filter((statistic) => statistic !== 'vaccinated' || !hideVaccinated);

  const showDistricts = tableOption === 'Districts' && !hideDistrictData;

  useEffect(() => {
    if (!showDistricts) setPage(0);
  }, [showDistricts]);

  return (
    <div className="Table">
      <div className="table-top">
        <animated.div
          className={classnames('option-toggle', {
            'is-highlighted': showDistricts,
          })}
          onClick={_setTableOption}
          style={trail[0]}
        >
          <OrganizationIcon size={14} />
        </animated.div>

        <animated.div
          className={classnames('million-toggle', {
            'is-highlighted': isPerMillion,
          })}
          onClick={setIsPerMillion.bind(this, !isPerMillion)}
          style={trail[0]}
        >
          <span>10L</span>
        </animated.div>

        <animated.div
          className={classnames('info-toggle', {
            'is-highlighted': isInfoVisible,
          })}
          onClick={setIsInfoVisible.bind(this, !isInfoVisible)}
          style={trail[0]}
        >
          <QuestionIcon size={14} />
        </animated.div>

        <animated.div
          className={classnames('expand-table-toggle', {
            'is-highlighted': expandTable,
          })}
          style={trail[1]}
          onClick={setExpandTable.bind(this, !expandTable)}
        >
          <FoldDownIcon size={16} />
        </animated.div>
      </div>

      {transition(
        (style, item) =>
          item && (
            <animated.div className="table-helper" {...{style}}>
              <div className="helper-top">
                <div className="helper-left">
                  <div className="info-item">
                    <span>
                      <OrganizationIcon size={14} />
                    </span>
                    <p>{t('Toggle between States/Districts')}</p>
                  </div>

                  <div className="info-item">
                    <h5>10L</h5>
                    <p>{t('Per Ten Lakh People')}</p>
                  </div>

                  <div className="info-item sort">
                    <span>
                      <FilterIcon size={14} />
                    </span>
                    <p>{t('Sort by Descending')}</p>
                  </div>

                  <div className="info-item sort invert">
                    <span>
                      <FilterIcon size={14} />
                    </span>
                    <p>{t('Sort by Ascending')}</p>
                  </div>

                  <div className="info-item sort">
                    <TableDeltaHelper />
                  </div>

                  <div className="info-item notes">
                    <span>
                      <InfoIcon size={15} />
                    </span>
                    <p>{t('Notes')}</p>
                  </div>
                </div>
                <div className="helper-right">
                  <div className="info-item">
                    <p>{t('Units')}</p>
                  </div>
                  {Object.entries({'1K': 3, '1L': 5, '1Cr': 7}).map(
                    ([abbr, exp]) => (
                      <div className="info-item" key={abbr}>
                        <h5>{abbr}</h5>
                        <p>
                          10
                          <sup
                            style={{
                              verticalAlign: 'baseline',
                              position: 'relative',
                              top: '-.4em',
                            }}
                          >
                            {exp}
                          </sup>
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <h5 className="text">
                {t('Compiled from State Govt. numbers')},{' '}
                <Link to="/about">{t('know more')}!</Link>
              </h5>
            </animated.div>
          )
      )}
      <div className="table-container">
        <div
          className="table"
          style={{
            gridTemplateColumns: `repeat(${tableStatistics.length + 1}, auto)`,
          }}
        >
          <div className="row heading">
            <div
              className="cell heading sticky"
              onClick={handleSortClick.bind(this, 'regionName')}
            >
              <div>{t(!showDistricts ? 'State/UT' : 'District')}</div>
              {sortData.sortColumn === 'regionName' && (
                <div
                  className={classnames('sort-icon', {
                    invert: sortData.isAscending,
                  })}
                >
                  <FilterIcon size={10} />
                </div>
              )}
            </div>

            {tableStatistics.map((statistic) => (
              <HeaderCell
                key={statistic}
                {...{statistic, sortData, setSortData}}
                handleSort={handleSortClick.bind(this, statistic)}
              />
            ))}
          </div>

          {!showDistricts &&
            Object.keys(states)
              .filter(
                (stateCode) =>
                  stateCode !== 'TT' &&
                  !(stateCode === UNASSIGNED_STATE_CODE && isPerMillion)
              )
              .sort((a, b) => sortingFunction(a, b))
              .map((stateCode) => {
                return (
                  <Row
                    key={stateCode}
                    data={states[stateCode]}
                    {...{
                      stateCode,
                      isPerMillion,
                      regionHighlighted,
                      setRegionHighlighted,
                      expandTable,
                      lastUpdatedTT,
                      tableStatistics,
                    }}
                  />
                );
              })}

          {showDistricts && !districts && <TableLoader />}

          {showDistricts &&
            districts &&
            Object.keys(districts)
              .sort((a, b) => sortingFunction(a, b))
              .slice(
                page * DISTRICT_TABLE_COUNT,
                (page + 1) * DISTRICT_TABLE_COUNT
              )
              .map((districtKey) => {
                return (
                  <Row
                    key={districtKey}
                    data={districts[districtKey]}
                    districtName={districts[districtKey].districtName}
                    {...{
                      isPerMillion,
                      regionHighlighted,
                      setRegionHighlighted,
                      expandTable,
                      lastUpdatedTT,
                      tableStatistics,
                    }}
                  />
                );
              })}

          <Row
            key={'TT'}
            data={states['TT']}
            stateCode={'TT'}
            {...{
              isPerMillion,
              regionHighlighted,
              setRegionHighlighted,
              expandTable,
              lastUpdatedTT,
              tableStatistics,
            }}
          />
        </div>
      </div>
      {showDistricts && (
        <div className="paginate">
          <div
            className={classnames('left', {disabled: page === 0})}
            onClick={handlePageClick.bind(this, -2)}
          >
            <ChevronsLeft size={16} />
          </div>
          <div
            className={classnames('left', {disabled: page === 0})}
            onClick={handlePageClick.bind(this, -1)}
          >
            <ChevronLeft size={16} />
          </div>
          <h5>{`${page + 1} / ${numPages}`}</h5>
          <div
            className={classnames('right', {disabled: page === numPages - 1})}
            onClick={handlePageClick.bind(this, 1)}
          >
            <ChevronRight size={16} />
          </div>
          <div
            className={classnames('right', {disabled: page === numPages - 1})}
            onClick={handlePageClick.bind(this, 2)}
          >
            <ChevronsRight size={16} />
          </div>
        </div>
      )}
    </div>
  );
}

const isEqual = (prevProps, currProps) => {
  if (
    !equal(
      prevProps.regionHighlighted?.districtName,
      currProps.regionHighlighted?.districtName
    )
  ) {
    return false;
  } else if (
    !equal(
      prevProps.regionHighlighted?.stateCode,
      currProps.regionHighlighted?.stateCode
    )
  ) {
    return false;
  } else if (!equal(prevProps.date, currProps.date)) {
    return false;
  } else if (!equal(prevProps.hideDistrictData, currProps.hideDistrictData)) {
  } else if (!equal(prevProps.hideVaccinated, currProps.hideVaccinated)) {
    return false;
  } else if (
    !equal(
      prevProps.data['TT'].total.confirmed,
      currProps.data['TT'].total.confirmed
    )
  ) {
    return false;
  } else if (!equal(prevProps.expandTable, currProps.expandTable)) {
    return false;
  } else return true;
};

export default memo(Table, isEqual);
