import pstats

p = pstats.Stats('run.prof')
p.sort_stats('time').print_stats(10)