import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Badge,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import HistoryIcon from '@mui/icons-material/History';
import TableChartIcon from '@mui/icons-material/TableChart';
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import axios from 'axios';

const BASE_URL = 'https://eventra-18by.onrender.com';

// Quick query templates
const TEMPLATES = [
  { label: 'All Events', query: 'SELECT * FROM Events ORDER BY created_at DESC;' },
  { label: 'All Users', query: 'SELECT id, email, first_name, last_name, role, created_at FROM Users ORDER BY created_at DESC;' },
  { label: 'Show Tables', query: 'SHOW TABLES;' },
  { label: 'Event Count', query: 'SELECT COUNT(*) as total_events FROM Events WHERE is_deleted = false;' },
  { label: 'User Count', query: 'SELECT COUNT(*) as total_users FROM Users WHERE is_deleted = false;' },
  { label: 'Recent Events', query: 'SELECT event_name, user_name, start_date, location FROM Events WHERE is_deleted = false ORDER BY created_at DESC LIMIT 10;' },
];

// Minimal SQL keyword highlighter
const highlightSQL = (sql) => {
  if (!sql) return '';
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE', 'DATABASE', 'JOIN', 'LEFT',
    'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'NULL', 'IS',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'AS', 'DISTINCT',
    'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'SHOW', 'DESCRIBE', 'EXPLAIN',
    'TRUE', 'FALSE', 'IN', 'LIKE', 'BETWEEN', 'EXISTS', 'CASE', 'WHEN',
    'THEN', 'ELSE', 'END', 'PRIMARY', 'KEY', 'INDEX', 'UNIQUE', 'ASC', 'DESC',
  ];
  // Simple replacement — only works for display div, not actual editor
  let result = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  keywords.forEach(kw => {
    result = result.replace(
      new RegExp(`\\b${kw}\\b`, 'gi'),
      `<span style="color:#8B85FF;font-weight:700;">${kw.toUpperCase()}</span>`
    );
  });
  // Strings
  result = result.replace(/'([^']*)'/g, `<span style="color:#16F4D0;">'$1'</span>`);
  // Numbers
  result = result.replace(/\b(\d+)\b/g, `<span style="color:#FF6584;">$1</span>`);
  // Comments
  result = result.replace(/(--[^\n]*)/g, `<span style="color:#A7A9BE;font-style:italic;">$1</span>`);

  return result;
};

const AdminQueryPage = () => {
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  const [query, setQuery] = useState('SELECT * FROM Events ORDER BY created_at DESC;');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [execTime, setExecTime] = useState(null);

  const user = authService.getUser();

  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, []);

  const runQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const start = Date.now();

    try {
      const token = authService.getToken();
      const response = await axios.post(
        `https://eventra-18by.onrender.com/api/admin/query`,
        { query: query.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const elapsed = Date.now() - start;
      setExecTime(elapsed);
      setResult(response.data);

      // Add to history
      setHistory(prev => [
        {
          query: query.trim(),
          timestamp: new Date(),
          success: true,
          rowCount: response.data.rowCount ?? response.data.affectedRows ?? 0,
          type: response.data.type,
        },
        ...prev.slice(0, 49), // keep last 50
      ]);
    } catch (err) {
      const elapsed = Date.now() - start;
      setExecTime(elapsed);
      const msg = err.response?.data?.message || err.message || 'Query failed';
      setError(msg);

      setHistory(prev => [
        { query: query.trim(), timestamp: new Date(), success: false, error: msg },
        ...prev.slice(0, 49),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery();
    }
    // Tab inserts spaces instead of focus change
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = query.substring(0, start) + '  ' + query.substring(end);
      setQuery(newVal);
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; }, 0);
    }
  };

  const copyResults = () => {
    if (!result?.data) return;
    const text = [
      Object.keys(result.data[0] || {}).join('\t'),
      ...result.data.map(row => Object.values(row).join('\t'))
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    if (!result?.data?.length) return;
    const headers = Object.keys(result.data[0]);
    const rows = result.data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = result?.data?.length > 0 ? Object.keys(result.data[0]) : [];

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#0F0E17',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Public Sans", sans-serif',
    }}>

      {/* Top Bar */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        px: 3, py: 2,
        background: 'linear-gradient(135deg, #1A1A2E 0%, #6C63FF 100%)',
        borderBottom: '2px solid rgba(108,99,255,0.4)',
        flexShrink: 0,
      }}>
        <Tooltip title="Back to Dashboard">
          <IconButton
            onClick={() => navigate('/')}
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <StorageIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '0.5px' }}>
              Query Runner
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', fontSize: '0.7rem' }}>
              LIVE DATABASE · ADMIN ONLY
            </Typography>
          </Box>
        </Box>

        <Chip
          label="⚠️ Production DB"
          size="small"
          sx={{ bgcolor: 'rgba(255,101,132,0.3)', color: '#FF6584', fontWeight: 700, border: '1px solid rgba(255,101,132,0.5)', ml: 1 }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Chip
          label={user?.email}
          size="small"
          sx={{ bgcolor: 'rgba(108,99,255,0.4)', color: 'white', fontWeight: 600, border: '1px solid rgba(108,99,255,0.5)' }}
        />

        <Tooltip title="Query History">
          <IconButton
            onClick={() => setHistoryOpen(true)}
            sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
          >
            <Badge badgeContent={history.length} color="primary" max={99}>
              <HistoryIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left sidebar — templates */}
        <Box sx={{
          width: 220,
          flexShrink: 0,
          bgcolor: '#1A1A2E',
          borderRight: '1px solid rgba(108,99,255,0.2)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(108,99,255,0.15)' }}>
            <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.65rem' }}>
              Quick Templates
            </Typography>
          </Box>
          {TEMPLATES.map((t, i) => (
            <Box
              key={i}
              onClick={() => setQuery(t.query)}
              sx={{
                px: 2, py: 1.5, cursor: 'pointer',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'rgba(108,99,255,0.12)', pl: 2.5 },
              }}
            >
              <Typography variant="body2" sx={{ color: '#FFFFFE', fontWeight: 600, fontSize: '0.82rem', mb: 0.25 }}>
                {t.label}
              </Typography>
              <Typography variant="caption" sx={{
                color: '#6b7280', fontSize: '0.65rem',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                display: 'block',
              }}>
                {t.query.substring(0, 40)}…
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Main editor + results area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Editor section */}
          <Box sx={{
            p: 2.5, borderBottom: '1px solid rgba(108,99,255,0.2)',
            bgcolor: '#0F0E17', flexShrink: 0,
          }}>
            {/* Editor header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CodeIcon sx={{ color: '#6C63FF', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem' }}>
                  SQL Editor
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.65rem' }}>
                  (Ctrl+Enter to run)
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Clear editor">
                  <IconButton
                    size="small" onClick={() => { setQuery(''); setResult(null); setError(null); }}
                    sx={{ color: '#A7A9BE', '&:hover': { color: '#FF6584' } }}
                  >
                    <DeleteSweepIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Textarea editor */}
            <Box sx={{ position: 'relative' }}>
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                style={{
                  width: '100%',
                  minHeight: '160px',
                  maxHeight: '260px',
                  resize: 'vertical',
                  backgroundColor: '#1A1A2E',
                  color: '#FFFFFE',
                  border: '1px solid rgba(108,99,255,0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  outline: 'none',
                  boxSizing: 'border-box',
                  caretColor: '#6C63FF',
                  letterSpacing: '0.3px',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#6C63FF'; e.target.style.boxShadow = '0 0 0 3px rgba(108,99,255,0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(108,99,255,0.3)'; e.target.style.boxShadow = 'none'; }}
                placeholder="-- Write your SQL query here&#10;-- Ctrl+Enter to execute&#10;SELECT * FROM Events LIMIT 10;"
              />
            </Box>

            {/* Run button */}
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1.5 }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
                onClick={runQuery}
                disabled={loading || !query.trim()}
                sx={{
                  borderRadius: '10px', px: 4, py: 1.2, fontWeight: 700, fontSize: '0.9rem',
                  background: 'linear-gradient(135deg, #6C63FF 0%, #5548C8 100%)',
                  boxShadow: '0 6px 20px rgba(108,99,255,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8B85FF 0%, #6C63FF 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 28px rgba(108,99,255,0.5)',
                  },
                  '&:disabled': { opacity: 0.5 },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Executing...' : 'Run Query'}
              </Button>

              {execTime !== null && (
                <Chip
                  label={`${execTime}ms`}
                  size="small"
                  sx={{ bgcolor: 'rgba(22,244,208,0.1)', color: '#16F4D0', fontWeight: 600, border: '1px solid rgba(22,244,208,0.3)', fontFamily: 'monospace' }}
                />
              )}

              {result && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                  label={result.type === 'SELECT'
                    ? `${result.rowCount} row${result.rowCount !== 1 ? 's' : ''} returned`
                    : `${result.affectedRows} row${result.affectedRows !== 1 ? 's' : ''} affected`}
                  size="small"
                  sx={{ bgcolor: 'rgba(52,168,83,0.15)', color: '#34a853', fontWeight: 600, border: '1px solid rgba(52,168,83,0.3)' }}
                />
              )}

              {error && (
                <Chip
                  icon={<ErrorIcon sx={{ fontSize: 14 }} />}
                  label="Query failed"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,101,132,0.15)', color: '#FF6584', fontWeight: 600, border: '1px solid rgba(255,101,132,0.3)' }}
                />
              )}
            </Stack>
          </Box>

          {/* Results section */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>

            {/* Error */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: '12px', mb: 2,
                  bgcolor: 'rgba(244,67,54,0.08)',
                  border: '1px solid rgba(244,67,54,0.3)',
                  color: '#ff6b6b',
                  '& .MuiAlert-icon': { color: '#FF6584' },
                  fontFamily: '"Fira Code", monospace',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </Alert>
            )}

            {/* Mutation success */}
            {result && result.type === 'MUTATION' && (
              <Alert
                severity="success"
                sx={{
                  borderRadius: '12px', mb: 2,
                  bgcolor: 'rgba(52,168,83,0.08)',
                  border: '1px solid rgba(52,168,83,0.3)',
                  color: '#34a853',
                  '& .MuiAlert-icon': { color: '#34a853' },
                  fontSize: '0.9rem', fontWeight: 600,
                }}
              >
                {result.message}
              </Alert>
            )}

            {/* SELECT results table */}
            {result && result.type === 'SELECT' && (
              <Box>
                {/* Results toolbar */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <TableChartIcon sx={{ color: '#6C63FF', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ color: '#A7A9BE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.7rem' }}>
                      Results
                    </Typography>
                    <Chip
                      label={`${result.rowCount} rows · ${columns.length} columns`}
                      size="small"
                      sx={{ bgcolor: 'rgba(108,99,255,0.12)', color: '#8B85FF', fontWeight: 600, border: '1px solid rgba(108,99,255,0.25)', fontSize: '0.7rem' }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Tooltip title={copied ? 'Copied!' : 'Copy as TSV'}>
                      <IconButton
                        size="small" onClick={copyResults}
                        sx={{ color: copied ? '#16F4D0' : '#A7A9BE', '&:hover': { color: '#FFFFFE' } }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download as CSV">
                      <IconButton
                        size="small" onClick={downloadCSV}
                        sx={{ color: '#A7A9BE', '&:hover': { color: '#FFFFFE' } }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>

                {result.rowCount === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography sx={{ color: '#A7A9BE', fontStyle: 'italic' }}>
                      Query returned 0 rows.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer
                    component={Paper}
                    sx={{
                      bgcolor: '#1A1A2E',
                      border: '1px solid rgba(108,99,255,0.2)',
                      borderRadius: '12px',
                      overflow: 'auto',
                      maxHeight: 'calc(100vh - 460px)',
                      '&::-webkit-scrollbar': { width: '6px', height: '6px' },
                      '&::-webkit-scrollbar-track': { background: '#0F0E17' },
                      '&::-webkit-scrollbar-thumb': { background: '#6C63FF', borderRadius: '3px' },
                    }}
                  >
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {/* Row number column */}
                          <TableCell
                            sx={{
                              bgcolor: '#0F0E17', color: '#6b7280',
                              fontWeight: 700, fontSize: '0.72rem', width: 50,
                              borderBottom: '2px solid rgba(108,99,255,0.3)',
                              fontFamily: 'monospace', textAlign: 'center',
                            }}
                          >
                            #
                          </TableCell>
                          {columns.map((col) => (
                            <TableCell
                              key={col}
                              sx={{
                                bgcolor: '#0F0E17', color: '#8B85FF',
                                fontWeight: 700, fontSize: '0.75rem',
                                borderBottom: '2px solid rgba(108,99,255,0.3)',
                                whiteSpace: 'nowrap', fontFamily: 'monospace',
                                textTransform: 'uppercase', letterSpacing: '0.5px',
                              }}
                            >
                              {col}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.data.map((row, rowIdx) => (
                          <TableRow
                            key={rowIdx}
                            sx={{
                              '&:hover': { bgcolor: 'rgba(108,99,255,0.06)' },
                              '&:nth-of-type(even)': { bgcolor: 'rgba(255,255,255,0.02)' },
                            }}
                          >
                            <TableCell
                              sx={{
                                color: '#6b7280', fontSize: '0.72rem',
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                                fontFamily: 'monospace', textAlign: 'center',
                              }}
                            >
                              {rowIdx + 1}
                            </TableCell>
                            {columns.map((col) => {
                              const val = row[col];
                              const isNull = val === null || val === undefined;
                              const isBool = typeof val === 'boolean';
                              const isNum = typeof val === 'number';

                              return (
                                <TableCell
                                  key={col}
                                  sx={{
                                    color: isNull ? '#6b7280'
                                      : isBool ? (val ? '#16F4D0' : '#FF6584')
                                      : isNum ? '#FF6584'
                                      : '#FFFFFE',
                                    fontSize: '0.82rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    fontFamily: 'monospace',
                                    whiteSpace: 'nowrap',
                                    maxWidth: 280,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontStyle: isNull ? 'italic' : 'normal',
                                  }}
                                >
                                  {isNull ? 'NULL' : String(val)}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* Empty state */}
            {!result && !error && !loading && (
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100%', minHeight: 200, gap: 2,
                color: '#A7A9BE',
              }}>
                <StorageIcon sx={{ fontSize: 56, color: 'rgba(108,99,255,0.3)' }} />
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#6b7280' }}>
                  Run a query to see results here
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Use the templates on the left or write your own SQL
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* History Drawer */}
      <Drawer
        anchor="right"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        PaperProps={{
          sx: {
            width: 420, bgcolor: '#0F0E17',
            border: '1px solid rgba(108,99,255,0.25)',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
          },
        }}
      >
        <Box sx={{ p: 2.5, borderBottom: '1px solid rgba(108,99,255,0.2)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <HistoryIcon sx={{ color: '#6C63FF' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFE' }}>Query History</Typography>
              <Chip label={history.length} size="small" sx={{ bgcolor: 'rgba(108,99,255,0.3)', color: '#8B85FF', fontWeight: 700 }} />
            </Stack>
            <IconButton onClick={() => setHistoryOpen(false)} sx={{ color: '#A7A9BE' }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {history.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#6b7280' }}>No queries run yet.</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, overflowY: 'auto' }}>
            {history.map((item, i) => (
              <React.Fragment key={i}>
                <ListItemButton
                  onClick={() => { setQuery(item.query); setHistoryOpen(false); }}
                  sx={{ px: 2.5, py: 1.5, '&:hover': { bgcolor: 'rgba(108,99,255,0.08)' } }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        {item.success
                          ? <CheckCircleIcon sx={{ fontSize: 14, color: '#34a853' }} />
                          : <ErrorIcon sx={{ fontSize: 14, color: '#FF6584' }} />}
                        <Typography variant="caption" sx={{ color: item.success ? '#34a853' : '#FF6584', fontWeight: 700 }}>
                          {item.success
                            ? (item.type === 'SELECT' ? `${item.rowCount} rows` : `${item.rowCount} affected`)
                            : 'Error'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280', ml: 'auto' }}>
                          {item.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" sx={{
                        color: '#A7A9BE', fontFamily: 'monospace', fontSize: '0.75rem',
                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {item.query}
                      </Typography>
                    }
                  />
                </ListItemButton>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />
              </React.Fragment>
            ))}
          </List>
        )}

        {history.length > 0 && (
          <Box sx={{ p: 2, borderTop: '1px solid rgba(108,99,255,0.2)' }}>
            <Button
              fullWidth variant="outlined"
              onClick={() => setHistory([])}
              sx={{
                borderRadius: '10px', color: '#FF6584',
                borderColor: 'rgba(255,101,132,0.4)',
                '&:hover': { bgcolor: 'rgba(255,101,132,0.08)', borderColor: '#FF6584' },
              }}
            >
              Clear History
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default AdminQueryPage;
