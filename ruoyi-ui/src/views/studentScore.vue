<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      
      <el-form-item label="课程id" prop="courseId">
        <el-input
          v-model="queryParams.courseId"
          placeholder="请输入选修学分要求"
          clearable
          @keyup.enter.native="handleQuery"
        />        
      </el-form-item>
   
      <el-form-item label="授予方式" prop="grantType">
        <el-select clearable v-model="queryParams.grantType">
            <el-option
                key="1"
                label="直接授予"
                value="1"
              >{{'直接授予'}}
            </el-option>
            <el-option
                key="1"
                label="联合授予"
                value="2"
              >{{'联合授予'}}
            </el-option>
				</el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:score:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:score:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:score:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:score:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="scoreList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="课程id" align="center" prop="courseId" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="课程内容" align="center" prop="courseContent" />
      <el-table-column label="必修/选修" align="center" prop="necessary" :formatter="getNecessaryText" />
      <el-table-column label="要求次数" align="center" prop="requireTimes" />
      <el-table-column label="课程学分" align="center" prop="courseScore1" />
      <el-table-column label="授予类型" align="center" prop="grantType" :formatter="getGrantType" />

        <!-- <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:score:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:score:remove']"
          >删除</el-button>
        </template>
      </el-table-column> -->
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="学生id" prop="studentId">
          <el-input v-model="form.studentId" placeholder="请输入学生id" />
        </el-form-item>
        <el-form-item label="计划id" prop="planId">
          <el-input v-model="form.planId" placeholder="请输入计划id" />
        </el-form-item>
        <el-form-item label="总得分" prop="scoreSum">
          <el-input v-model="form.scoreSum" placeholder="请输入总得分" />
        </el-form-item>
        <el-form-item label="总得分要求" prop="scoreNeed">
          <el-input v-model="form.scoreNeed" placeholder="请输入总得分要求" />
        </el-form-item>
        <el-form-item label="必修学分要求" prop="scoreNecessary">
          <el-input v-model="form.scoreNecessary" placeholder="请输入必修学分要求" />
        </el-form-item>
        <el-form-item label="已获得必修学分" prop="scoreNecessarySum">
          <el-input v-model="form.scoreNecessarySum" placeholder="请输入已获得必修学分" />
        </el-form-item>
        <el-form-item label="选修学分要求" prop="scoreNoNecessary">
          <el-input v-model="form.scoreNoNecessary" placeholder="请输入选修学分要求" />
        </el-form-item>
        <el-form-item label="选修所得学分" prop="scoreNoNecessarySum">
          <el-input v-model="form.scoreNoNecessarySum" placeholder="请输入选修所得学分" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listScore, getScore, delScore, addScore, updateScore } from "@/api/system/studentScore";


export default {
  name: "Score",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // /score/search/list
      // 总条数
      total: 0,
      // 【请填写功能名称】表格数据
      scoreList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        studentId: null,
        planId: 1,
        scoreSum: null,
        scoreNeed: null,
        scoreNecessary: null,
        scoreNecessarySum: null,
        scoreNoNecessary: null,
        scoreNoNecessarySum: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        studentId: [
          { required: true, message: "学生id不能为空", trigger: "blur" }
        ],
        planId: [
          { required: true, message: "计划id不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      listScore(this.queryParams).then(response => {
        this.scoreList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    getNecessaryText(item) {
      let necessaryEnum = {1: "必修", 2: "选修"};
      return necessaryEnum[item.necessary];
    },
    getGrantType(item) {
      let GrantEnum = {1: "直接授予", 2: "联合授予"};
      return GrantEnum[item.grantType];
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        studentId: null,
        planId: null,
        scoreSum: null,
        scoreNeed: null,
        scoreNecessary: null,
        scoreNecessarySum: null,
        scoreNoNecessary: null,
        scoreNoNecessarySum: null,
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加【请填写功能名称】";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getScore(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改【请填写功能名称】";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateScore(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addScore(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项？').then(function() {
        return delScore(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/score/export', {
        ...this.queryParams
      }, `score_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
