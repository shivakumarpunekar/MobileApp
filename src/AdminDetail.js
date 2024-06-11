import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions, TouchableOpacity, TextInput } from 'react-native';

const AdminDetail = () => {
  const data = [
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
    { name: 'John Doe', position: 'Manager', office: 'New York', age: 30, startDate: '2015/04/25', salary: '$120,000' },
    { name: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '2018/02/15', salary: '$95,000' },
  
];

  const [pageNumber, setPageNumber] = useState(0);
  const scrollViewRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  // Filtered data based on search query
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(pageNumber * itemsPerPage, (pageNumber + 1) * itemsPerPage);

  const handleNextPage = () => {
    if (pageNumber < totalPages - 1) {
      scrollViewRef.current.scrollTo({ x: (pageNumber + 1) * Dimensions.get('window').width });
      setPageNumber(pageNumber + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 0) {
      scrollViewRef.current.scrollTo({ x: (pageNumber - 1) * Dimensions.get('window').width });
      setPageNumber(pageNumber - 1);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    setPageNumber(0); 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* ScrollView for pagination */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const contentOffsetX = event.nativeEvent.contentOffset.x;
          const currentPage = Math.floor(contentOffsetX / Dimensions.get('window').width);
          setPageNumber(currentPage);
        }}
      >
        {Array.from(Array(totalPages).keys()).map((page, index) => (
          <View key={index} style={styles.page}>
            <ScrollView
              horizontal={false}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.table}>
                <View style={[styles.row, styles.header]}>
                  <Text style={styles.cell}>Name</Text>
                  <Text style={styles.cell}>Position</Text>
                  <Text style={styles.cell}>Office</Text>
                  <Text style={styles.cell}>Age</Text>
                  <Text style={styles.cell}>Start Date</Text>
                  <Text style={styles.cell}>Salary</Text>
                </View>
                {paginatedData.map((item, idx) => (
                  <View key={idx} style={styles.row}>
                    <Text style={styles.cell}>{item.name}</Text>
                    <Text style={styles.cell}>{item.position}</Text>
                    <Text style={styles.cell}>{item.office}</Text>
                    <Text style={styles.cell}>{item.age}</Text>
                    <Text style={styles.cell}>{item.startDate}</Text>
                    <Text style={styles.cell}>{item.salary}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Controls */}
      <View style={styles.pagination}>
        <TouchableOpacity style={[styles.button, { opacity: pageNumber === 0 ? 0.5 : 1 }]} onPress={handlePrevPage} disabled={pageNumber === 0}>
          <Text style={styles.buttonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageNumberText}>{pageNumber + 1} / {totalPages}</Text>
        <TouchableOpacity style={[styles.button, { opacity: pageNumber === totalPages - 1 ? 0.5 : 1 }]} onPress={handleNextPage} disabled={pageNumber === totalPages - 1}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  page: {
    width: Dimensions.get('window').width,
    paddingHorizontal: 10,
  },
  table: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  header: {
    backgroundColor: '#f0f0f0',
  },
  cell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#BFA100',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pageNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchBarContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default AdminDetail;
